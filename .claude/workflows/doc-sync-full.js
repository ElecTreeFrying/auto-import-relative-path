export const meta = {
  name: 'doc-sync-full',
  description: 'Exhaustive pre-publish doc-sync audit of all of src/: enumerate every non-test source file, detect doc drift file-by-file + per-dir + across the four cross-directory sync contracts + an interconnection pass (registration tables & cross-doc links, so adds/removes/relocations don\'t break the doc web), adversarially verify, apply doc-only fixes (one writer per dir; out-of-src findings report-only), run a completeness critic, then advance the doc-sync watermark to HEAD.',
  whenToUse: 'Defaults to REPORT mode (no writes — proposes edits + runs the completeness critic). Pass args {mode:"fix"} to actually apply doc-only edits and advance the watermark. Run once as a backfill/seed or for a periodic full re-audit; day-to-day use the incremental doc-sync-auditor agent instead.',
  phases: [
    { title: 'Enumerate', detail: 'git ls-files → work-list of source files + doc-dirs' },
    { title: 'Detect', detail: 'one Explore agent per file + one per doc-dir' },
    { title: 'Contracts', detail: 'one Explore agent per cross-dir sync contract + one interconnection pass (tables & links)' },
    { title: 'Verify', detail: '3-lens adversarial check per finding' },
    { title: 'Apply', detail: 'one writer per dir applies doc-only fixes' },
    { title: 'Complete', detail: 'completeness critic + advance watermark' },
  ],
}

// ---------- schemas ----------
const ENUM_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    docDirs: { type: 'array', items: { type: 'string' } },
  },
  required: [ 'files', 'docDirs' ],
}
const FINDING = {
  type: 'object', additionalProperties: false,
  properties: {
    docDir: { type: 'string' },
    docFile: { type: 'string', enum: [ 'CLAUDE.md', 'README.md' ] },
    category: { type: 'string', enum: [ 'Stale', 'Drift', 'Gap', 'Orphan', 'Broken invariant' ] },
    severity: { type: 'string', enum: [ 'high', 'medium', 'low' ] },
    docLocation: { type: 'string' },
    claim: { type: 'string' },
    reality: { type: 'string' },
    proposedFix: { type: 'string' },
  },
  required: [ 'docDir', 'docFile', 'category', 'claim', 'reality', 'proposedFix' ],
}
const FINDINGS_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { findings: { type: 'array', items: FINDING } },
  required: [ 'findings' ],
}
const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    real: { type: 'boolean' },
    reason: { type: 'string' },
    refinedFix: { type: 'string' },
  },
  required: [ 'real', 'reason' ],
}
const APPLY_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    dir: { type: 'string' },
    edited: { type: 'boolean' },
    filesTouched: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: [ 'dir', 'summary' ],
}
const CRITIC_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    uncovered: { type: 'array', items: { type: 'string' } },
    unverifiedClaims: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: [ 'uncovered', 'unverifiedClaims' ],
}

const ROT = 'Categories: Stale (claim no longer true), Drift (doc vs code diverged — especially byte-exact contracts), Gap (code has something the docs do not cover), Orphan (doc references a renamed/deleted file/symbol/path), Broken invariant (a documented invariant/sync-contract is violated).'
// `args` may arrive as an object OR as a JSON string — normalise both. Default to the SAFE
// mode (report = no writes); `fix` must be requested explicitly, so an args mishap can never
// again trigger unintended edits.
let parsedArgs = args
if (typeof parsedArgs === 'string') {
  try { parsedArgs = JSON.parse(parsedArgs) } catch (e) { parsedArgs = {} }
}
const MODE = (parsedArgs && parsedArgs.mode === 'fix') ? 'fix' : 'report'
log(`doc-sync-full starting in ${MODE} mode` + (MODE === 'report' ? ' — NO writes (pass args {mode:"fix"} to apply)' : ' — will edit docs + advance watermark'))

// ---------- Phase 1: Enumerate (deterministic work-list) ----------
phase('Enumerate')
const work = await agent(
  `Build the exhaustive work-list for a doc-sync audit. Use git (read-only).
   files: every .ts under src/ that is NOT under src/test/ and does not end in .test.ts. Collect from BOTH:
     - git ls-files 'src/*.ts' 'src/**/*.ts'                              (tracked)
     - git ls-files --others --exclude-standard 'src/*.ts' 'src/**/*.ts'  (new, uncommitted, not gitignored)
     Union them, then drop anything under src/test/ or ending in .test.ts.
   docDirs: every directory under src/ (including 'src' itself) that contains BOTH CLAUDE.md and README.md.
     Find candidate CLAUDE.md from BOTH git ls-files 'src/CLAUDE.md' 'src/**/CLAUDE.md' AND
     git ls-files --others --exclude-standard 'src/CLAUDE.md' 'src/**/CLAUDE.md'; confirm a sibling README.md on disk.
   Return repo-relative paths.`,
  { label: 'enumerate', phase: 'Enumerate', agentType: 'Explore', schema: ENUM_SCHEMA }
)
log(`Work-list: ${work.files.length} files, ${work.docDirs.length} doc-dirs`)

function owningDir(file) {
  const parts = file.split('/')
  for (let i = parts.length - 1; i >= 1; i--) {
    const cand = parts.slice(0, i).join('/')
    if (work.docDirs.includes(cand)) return cand
  }
  return 'src'
}

// ---------- Phase 2+3: Detect (file + dir + contracts) — all read-only, one parallel batch ----------
phase('Detect')
const CONTRACTS = [
  { key: 'four-site-extension', desc: 'Four-site extension sync: an extension must agree across src/types/file-extension.ts (type union) -> src/constants/extensions.ts (runtime list) -> src/snippets/dispatch.ts -> src/snippets/variants.ts. Check the docs at root CLAUDE.md and the types/constants/snippets doc-pairs describe the CURRENT code at all four sites.' },
  { key: 'three-site-config', desc: 'Three-site config sync: setting enum strings byte-identical across package.json (contributes.configuration enums) -> src/snippets/_styles.ts -> each per-language switch in src/snippets/languages/. NOTE package.json is OUTSIDE src/. Check the docs match current code at all three sites.' },
  { key: 'two-site-button', desc: 'Two-site button-label sync: toast button labels in src/editor/notification.ts must match the switch cases in src/commands/copy-file-path.ts character-for-character. Check the docs describing this still match the code.' },
  { key: 'runtime-type-mirror', desc: 'Runtime-type mirror: IMAGE_FILE_EXTENSIONS mirrors ImageFileExtension; TEXT_TRACK_FILE_EXTENSIONS mirrors TextTrackFileExtension; MEDIA_FILE_EXTENSIONS is video+audio only (.vtt lives in TEXT_TRACK). Check src/constants and src/types docs match current code.' },
]

const detectThunks = [
  ...work.files.map(file => () => {
    const dir = owningDir(file)
    return agent(
      `Doc-sync DETECTION for ONE source file. READ-ONLY.\n` +
      `File: ${file}\nOwning doc-dir: ${dir} (docs: ${dir}/CLAUDE.md, ${dir}/README.md)\n` +
      `Read the file and those two doc files. Report every way THIS FILE makes the docs wrong. ${ROT}\n` +
      `Lens: CLAUDE.md = conventions/sync-rules/gotchas/dependency-direction; README.md = file inventory/public exports/"where to add code".\n` +
      `Each finding: docDir, docFile, category, severity, docLocation (file:line or quote), claim, reality, concrete proposedFix. None? return empty findings.`,
      { label: `file:${file}`, phase: 'Detect', agentType: 'Explore', schema: FINDINGS_SCHEMA }
    )
  }),
  ...work.docDirs.map(dir => () =>
    agent(
      `Doc-sync DETECTION for a WHOLE directory (catches what one file can't: inventory completeness, orphans, "where to add code"). READ-ONLY.\n` +
      `Directory: ${dir}. List its real source files (git ls-files '${dir}/*.ts'; for src/ also extension.ts/gating.ts; for src/snippets also languages/*). Read ${dir}/CLAUDE.md and ${dir}/README.md.\n` +
      `Find: files in code but missing from the README inventory (Gap); files/symbols named in docs but gone (Orphan); stale conventions; drifted contracts. ${ROT}\n` +
      `Each finding: docDir, docFile, category, severity, docLocation, claim, reality, proposedFix.`,
      { label: `dir:${dir}`, phase: 'Detect', agentType: 'Explore', schema: FINDINGS_SCHEMA }
    )
  ),
  ...CONTRACTS.map(c => () =>
    agent(
      `Doc-sync DETECTION for a CROSS-DIRECTORY sync contract (a single-file pass cannot see these). READ-ONLY.\n` +
      `Contract: ${c.desc}\n` +
      `Read the code at EVERY site and the docs that describe it. Report any place the docs are stale/drifted/wrong about the contract, or where the contract itself looks broken in code (category "Broken invariant" — do NOT edit code). ${ROT}\n` +
      `Each finding: docDir (the doc needing the fix), docFile, category, severity, docLocation, claim, reality, proposedFix.`,
      { label: `contract:${c.key}`, phase: 'Contracts', agentType: 'Explore', schema: FINDINGS_SCHEMA }
    )
  ),
  // interconnection: the doc WEB itself — registration tables + cross-doc links vs the live doc-dir set.
  // (A single-file/single-dir pass can't see a dead table row or a broken cross-link from a move/rename.)
  () => agent(
    `Doc-sync DETECTION for the INTERCONNECTION layer — the registration tables and cross-doc links that wire the doc web together. READ-ONLY.\n` +
    `Live doc-dir set (ground truth): ${work.docDirs.join(', ')}.\n` +
    `Registration sites: root CLAUDE.md (the "Subdirectory guides" table), src/README.md, src/CLAUDE.md. ` +
    `Check each: a row pointing at a renamed/removed dir = Orphan (high-confidence); a live dir absent from a table = Gap (ADVISORY — the tables are curated, e.g. src/test/fixtures is intentionally unlisted; only flag a dir that clearly belongs). ` +
    `Also verify relative [text](path) and [[name]] links in every CLAUDE.md/README.md resolve to a real file (broken target = Orphan).\n` +
    `For any finding in root CLAUDE.md set docDir to "." (it is outside src/ and will be report-only). ${ROT}\n` +
    `Each finding: docDir, docFile, category, severity, docLocation, claim, reality, proposedFix.`,
    { label: 'interconnect', phase: 'Contracts', agentType: 'Explore', schema: FINDINGS_SCHEMA }
  ),
]

const detection = await parallel(detectThunks)   // barrier: need all findings before dedup
const raw = detection.filter(Boolean).flatMap(r => r.findings || [])
const seen = new Set()
const deduped = []
for (const f of raw) {
  const k = [ f.docDir, f.docFile, f.category, (f.claim || '').slice(0, 80) ].join('|')
  if (!seen.has(k)) { seen.add(k); deduped.push(f) }
}
log(`Detection: ${raw.length} raw -> ${deduped.length} deduped findings`)

// ---------- Phase 4: Verify (3-lens adversarial, majority vote) ----------
phase('Verify')
const verified = await parallel(deduped.map(f => () =>
  parallel([ 'correctness', 'evidence', 'reproduce' ].map(lens => () =>
    agent(
      `Adversarially verify a doc-sync finding via the ${lens} lens. Default real=false unless evidence clearly holds.\n` +
      `In ${f.docDir}/${f.docFile} [${f.category}] doc claims: "${f.claim}". Reality: "${f.reality}". Proposed fix: "${f.proposedFix}".\n` +
      `Read the actual doc location AND the actual code. Is this a REAL doc-sync problem warranting the fix? Return real, reason, refinedFix (tightened fix or empty).`,
      { label: `verify:${f.category}:${f.docDir}`, phase: 'Verify', agentType: 'Explore', schema: VERDICT_SCHEMA }
    )
  )).then(votes => {
    const v = votes.filter(Boolean)
    const real = v.filter(x => x.real).length >= 2
    const refinedFix = (v.find(x => x.real && x.refinedFix) || {}).refinedFix || f.proposedFix
    return { ...f, real, refinedFix }
  })
))
const confirmed = verified.filter(Boolean).filter(f => f.real)
log(`Confirmed ${confirmed.length}/${deduped.length} after 3-lens verify`)

// ---------- Phase 5: Apply (one writer per dir; disjoint files) ----------
phase('Apply')
// Split confirmed findings: writer-owned (a doc-dir under src/) vs out-of-scope (e.g. root CLAUDE.md) -> report-only.
const byDir = {}
const reportedOnly = []
for (const f of confirmed) {
  if (work.docDirs.includes(f.docDir)) {
    (byDir[f.docDir] = byDir[f.docDir] || []).push(f)
  } else {
    reportedOnly.push(f)   // e.g. root CLAUDE.md — outside src/, no writer owns it; never auto-edited
  }
}
const dirs = Object.keys(byDir)
if (reportedOnly.length) log(`${reportedOnly.length} finding(s) outside src/ (e.g. root CLAUDE.md) — report-only, never auto-edited`)
const applied = await parallel(dirs.map(dir => () => {
  const items = byDir[dir].map((f, i) =>
    `${i + 1}. [${f.category}] ${f.docFile} @ ${f.docLocation || '?'}\n   claim: ${f.claim}\n   reality: ${f.reality}\n   fix: ${f.refinedFix}`
  ).join('\n')
  const instruction = MODE === 'report'
    ? `REPORT ONLY — do NOT edit. For each item give the exact edit you WOULD make (old -> new).`
    : `Apply the fixes by editing ONLY ${dir}/CLAUDE.md and ${dir}/README.md. Keep edits minimal; match the existing doc voice and structure.`
  return agent(
    `You are the SINGLE writer for ${dir}. ${instruction}\n` +
    `HARD RULES: touch ONLY ${dir}/CLAUDE.md and ${dir}/README.md — never code, tests, package.json, the root README, anything under .claude/, or process/. Re-read the code to confirm each item before applying; drop any that no longer holds.\n` +
    `Findings:\n${items}`,
    { label: `apply:${dir}`, phase: 'Apply', agentType: MODE === 'report' ? 'Explore' : undefined, schema: APPLY_SCHEMA }
  )
}))

// ---------- Phase 6: Completeness critic + watermark ----------
phase('Complete')
const critic = await agent(
  `Completeness critic for an exhaustive doc-sync audit. Work-list was ${work.files.length} files across ${work.docDirs.length} doc-dirs; ${confirmed.length} findings were confirmed and ${MODE === 'fix' ? 'applied' : 'proposed'}.\n` +
  `Identify anything possibly MISSED: a source file or doc-dir not represented that plausibly needed checking, any cross-directory contract not fully validated, or any confirmed fix that reads as risky. Return uncovered (paths/contracts) and unverifiedClaims; empty arrays if none.`,
  { label: 'completeness-critic', phase: 'Complete', agentType: 'Explore', schema: CRITIC_SCHEMA }
)

let watermark = null
if (MODE === 'fix') {
  watermark = await agent(
    `Advance the doc-sync watermark so the incremental doc-sync-auditor takes over. Run git rev-parse HEAD and write that SHA (single line) to .claude/agents/state/doc-sync-watermark.txt (create dir/file if needed). Git reads only; do NOT commit. Return the SHA written.`,
    { label: 'advance-watermark', phase: 'Complete' }
  )
}

return {
  mode: MODE,
  workList: { files: work.files.length, docDirs: work.docDirs.length },
  findings: { raw: raw.length, deduped: deduped.length, confirmed: confirmed.length },
  byDir: dirs.map(d => ({ dir: d, count: byDir[d].length })),
  applied: applied.filter(Boolean),
  reportedOnly: reportedOnly.map(f => ({ docDir: f.docDir, docFile: f.docFile, category: f.category, docLocation: f.docLocation, claim: f.claim, reality: f.reality, fix: f.refinedFix })),
  completeness: critic,
  watermark,
}
