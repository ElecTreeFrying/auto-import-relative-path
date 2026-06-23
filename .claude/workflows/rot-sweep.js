export const meta = {
  name: 'rot-sweep',
  description: 'Diff-scoped /_rot audit of the UNCOMMITTED working tree across the product surface (src/, docs/, qa/, root product docs, package.json — .claude/ tooling, process/, build configs excluded by path). Reads only the in-scope files in git status (+ the witnesses they implicate), checks them against the code for the five /_rot categories (Stale, Drift, Gap, Orphan, Broken invariant), and REPORTS — never edits. Self-contained (reuses no local agent/workflow), report-only, all-Opus Explore agents, fan-out batched to dodge the StructuredOutput throttle.',
  whenToUse: 'Run before committing an accumulated pile of uncommitted changes, to catch doc/contract drift while it is fresh. Re-run after each fix — it only re-examines what is still uncommitted. NOT a completeness gate: for that, run the full-tree /_rot (or doc-sync-full / release-align) before publishing. Report-only — there is no fix mode.',
  phases: [
    { title: 'Enumerate', detail: 'git status → uncommitted path set + doc-dirs; bucket in JS' },
    { title: 'Detect', detail: 'one finder per changed file / implicated contract / Tier-1 partner doc / changelog (runBatched 6)' },
    { title: 'Verify', detail: 'single-lens refute-by-default per finding (runBatched 6)' },
    { title: 'Complete', detail: 'completeness critic emits the coverage manifest' },
  ],
}

// ---------- schemas (additionalProperties:false everywhere) ----------
const ENUM_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    changed: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: { path: { type: 'string' }, status: { type: 'string' } },
        required: [ 'path', 'status' ],
      },
    },
    docDirs: { type: 'array', items: { type: 'string' } },
  },
  required: [ 'changed', 'docDirs' ],
}
const FINDING = {
  type: 'object', additionalProperties: false,
  properties: {
    category: { type: 'string', enum: [ 'Stale', 'Drift', 'Gap', 'Orphan', 'Broken invariant' ] },
    severity: { type: 'string', enum: [ 'high', 'medium', 'low' ] },
    surface: { type: 'string' },     // the file/area the finding is about
    location: { type: 'string' },    // file:line for the doc claim
    claim: { type: 'string' },       // what the doc says
    reality: { type: 'string' },     // what the code does (source of truth)
    proposedFix: { type: 'string' }, // described, never applied
    tags: { type: 'array', items: { type: 'string' } }, // mechanical|behavioral, uncommitted|committed
  },
  required: [ 'category', 'surface', 'claim', 'reality', 'proposedFix' ],
}
const FINDINGS_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { findings: { type: 'array', items: FINDING } },
  required: [ 'findings' ],
}
const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { real: { type: 'boolean' }, reason: { type: 'string' }, refinedFix: { type: 'string' } },
  required: [ 'real', 'reason' ],
}
const MANIFEST_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    read: { type: 'array', items: { type: 'string' } },     // files actually opened (subjects + witnesses)
    checked: { type: 'array', items: { type: 'string' } },  // surfaces audited
    skipped: { type: 'array', items: { type: 'string' } },  // in-scope surfaces/contracts NOT covered + why
    notes: { type: 'string' },
  },
  required: [ 'read', 'checked', 'skipped' ],
}

const ROT = 'Categories: Stale (a doc statement no longer true), Drift (doc and code diverged — especially byte-exact cross-site contracts), Gap (code has something the docs do not cover), Orphan (a doc/table/link references a renamed/deleted file/symbol/path, or a new file nothing references), Broken invariant (a documented invariant/count/sync-contract is violated, e.g. the "seven commands" count or the dependency-direction rule).'
const READONLY = 'READ-ONLY. Do NOT edit, create, or delete any file. Use git for reads only (never a mutating git command).'

// The four cross-site contracts (encoded — this is rot-sweep's knowledge of the CODE's architecture,
// per the spec's "Deliberately self-contained" decision; root CLAUDE.md is the canonical prose). A
// contract finder runs only if the uncommitted set intersects its member files / dirs.
const CONTRACTS = [
  { key: 'four-site-extension', members: [ 'src/types/file-extension.ts', 'src/constants/extensions.ts', 'src/snippets/dispatch.ts', 'src/snippets/variants.ts' ],
    desc: 'Four-site extension sync: a file extension must agree across src/types/file-extension.ts (type union) -> src/constants/extensions.ts (runtime list) -> src/snippets/dispatch.ts -> src/snippets/variants.ts. (Non-script asset sources into JSX/TSX/MDX route through src/snippets/_react.ts:buildAssetImportStatement instead of dispatch.ts; only JSX/TSX/MDX-exclusive sources like fonts skip the constants gating table — images/media/docs/components also target gated destinations and keep their constants entries.)' },
  { key: 'three-site-config', members: [ 'package.json', 'src/snippets/_styles.ts' ], dirs: [ 'src/snippets/languages/' ],
    desc: 'Three-site config sync: setting enum strings byte-identical across package.json (contributes.configuration enums) -> src/snippets/_styles.ts -> each per-language switch in src/snippets/languages/. Four dormant single-shape keys (cssImage, scssImage, htmlStyleSheet, markdown) are kept in package.json for back-compat but NOT style-synced at runtime — do not flag those as drift.' },
  { key: 'two-site-button', members: [ 'src/editor/notification.ts', 'src/commands/copy-file-path.ts', 'src/commands/reset-import-styles.ts' ],
    desc: 'Two-site button-label sync: toast action button labels in src/editor/notification.ts must match the switch cases in src/commands/copy-file-path.ts (copy-success buttons) and src/commands/reset-import-styles.ts (styles-reset Undo) character-for-character.' },
  { key: 'runtime-type-mirror', members: [ 'src/constants/extensions.ts', 'src/types/file-extension.ts' ],
    desc: 'Runtime-type mirror: IMAGE_FILE_EXTENSIONS mirrors ImageFileExtension; TEXT_TRACK_FILE_EXTENSIONS mirrors TextTrackFileExtension; MEDIA_FILE_EXTENSIONS is video+audio only (.vtt lives in TEXT_TRACK_FILE_EXTENSIONS); both spread together into destination lists. In src/constants/extensions.ts <-> src/types/file-extension.ts.' },
]

// ---------- helpers ----------
async function runBatched(thunks, size, label) {
  const out = []
  const total = Math.ceil(thunks.length / size) || 1
  for (let i = 0; i < thunks.length; i += size) {
    const slice = thunks.slice(i, i + size)
    log(`${label}: wave ${Math.floor(i / size) + 1}/${total} (${slice.length} agents)`)
    const res = await parallel(slice)
    out.push(...res)
  }
  return out
}
function owningDir(file, docDirs) {
  const parts = file.split('/')
  for (let i = parts.length - 1; i >= 1; i--) {
    const cand = parts.slice(0, i).join('/')
    if (docDirs.includes(cand)) return cand
  }
  return 'src'
}
function contractImplicated(c, paths) {
  if (c.members.some(m => paths.includes(m))) return true
  if (c.dirs && c.dirs.some(d => paths.some(p => p.startsWith(d)))) return true
  return false
}

// ---------- args: REPORT-ONLY by design (no fix path; the args-mishap footgun cannot exist here) ----------
let parsedArgs = args
if (typeof parsedArgs === 'string') { try { parsedArgs = JSON.parse(parsedArgs) } catch (e) { parsedArgs = {} } }
parsedArgs = parsedArgs || {}
const MODE = 'report'
log('rot-sweep starting — REPORT ONLY, diff-scoped to the uncommitted working tree (writes nothing).')

const FULL_PASS_POINTER = 'Diff-scoped — NOT a completeness guarantee. For that, run the full-tree /_rot (or doc-sync-full / release-align) before publishing.'
const OUT_OF_SCOPE_NOTE = 'Packaging / .vscodeignore audit is out of scope — owned by release-align. rot-sweep writes nothing; the caller persists this report (optionally to the gitignored .claude/rot-sweep.audit.md).'

// ---------- Phase 1: Enumerate ----------
phase('Enumerate')
const work = await agent(
  `Enumerate the UNCOMMITTED working-tree change set for a diff-scoped rot sweep. ${READONLY} git reads only.\n` +
  `1. Run: git status --porcelain=v1 . Parse each line into {path, status} where status is the 2-char XY code (e.g. " M", "M ", "MM", "A ", "D ", "??", "R "). For a rename line ("R  old -> new") record the NEW path with status "R" (put "new <- old" in path if helpful). Include untracked ("??"). git status already omits gitignored paths — keep it that way.\n` +
  `2. docDirs: every directory under src/ (including "src" itself) that contains BOTH CLAUDE.md and README.md. Find candidate CLAUDE.md via git ls-files 'src/CLAUDE.md' 'src/**/CLAUDE.md' AND git ls-files --others --exclude-standard for untracked ones; confirm a sibling README.md on disk.\n` +
  `Return changed ({path,status}[]) and docDirs (repo-relative dir paths).`,
  { label: 'enumerate', phase: 'Enumerate', agentType: 'Explore', model: 'opus', schema: ENUM_SCHEMA }
)

const changed = (work && work.changed) || []
const docDirs = (work && work.docDirs) || []
const allPaths = changed.map(c => c.path)

if (!allPaths.length) {
  log('No uncommitted changes — nothing to sweep.')
  return {
    mode: 'report',
    scope: { changedFiles: 0, inScope: 0, finderTargets: 0 },
    findings: { total: 0, byCategory: {}, bySurface: {}, items: [] },
    coverage: { read: [], checked: [], skipped: [], notes: 'Empty working tree — nothing in scope.', fullPassPointer: FULL_PASS_POINTER },
    note: OUT_OF_SCOPE_NOTE,
  }
}

// ---------- scope = the PRODUCT surface (EXPLICIT), NOT "whatever is not gitignored" ----------
// A .gitignore edit must never silently move what this tool audits (the failure that motivated this rule).
// .claude/ tooling, process/, .vscode/, root build configs etc. are out of scope BY PATH — even if tracked.
const ROOT_DOCS = [ 'README.md', 'SPEC.md', 'SUPPORT.md', 'CLAUDE.md', 'CHANGELOG.md' ]
const isRootDoc = p => ROOT_DOCS.includes(p)
const isSrcCode = p => p.startsWith('src/') && p.endsWith('.ts') && !p.startsWith('src/test/') && !p.endsWith('.test.ts')
const isDocs = p => p.startsWith('docs/')
const isQa = p => p.startsWith('qa/')
const inProductScope = p => isRootDoc(p) || p === 'package.json' || isDocs(p) || isQa(p) || p.startsWith('src/')

const paths = allPaths.filter(inProductScope)
const outOfScope = allPaths.filter(p => !inProductScope(p))
if (outOfScope.length) {
  const claudeN = outOfScope.filter(p => p.startsWith('.claude/')).length
  log(`Out of product scope — skipped ${outOfScope.length} path(s)${claudeN ? ` (incl. ${claudeN} under .claude/ tooling)` : ''}. rot-sweep audits only src/, docs/, qa/, root product docs, package.json.`)
}
if (!paths.length) {
  log('Only out-of-scope changes (e.g. .claude/ tooling) — nothing in the product surface to sweep.')
  return {
    mode: 'report',
    scope: { changedFiles: allPaths.length, inScope: 0, finderTargets: 0, outOfScope },
    findings: { total: 0, byCategory: {}, bySurface: {}, items: [] },
    coverage: { read: [], checked: [], skipped: outOfScope, notes: 'No product-surface changes; pile is only out-of-scope paths (e.g. .claude/).', fullPassPointer: FULL_PASS_POINTER },
    note: OUT_OF_SCOPE_NOTE,
  }
}

// ---------- bucket the in-scope pile (plain JS — string logic only) ----------
const srcCodeFiles = paths.filter(isSrcCode)
const rootDocs = paths.filter(isRootDoc)
const docsFiles = paths.filter(isDocs)
const qaFiles = paths.filter(isQa)
const packageJsonChanged = paths.includes('package.json')
const affectedDirs = Array.from(new Set(
  paths.filter(p => p.startsWith('src/') && !p.startsWith('src/test/')).map(p => owningDir(p, docDirs))
))
const implicated = CONTRACTS.filter(c => contractImplicated(c, paths))
const hasBehaviouralCodeChange = srcCodeFiles.length > 0
const hasUserFacingChange = srcCodeFiles.length > 0 || packageJsonChanged
const hasStructural = changed.some(c => /[ADR?]/.test(c.status || ''))

// ---------- build the finder task list (each = {label, thunk}) ----------
const F = (label, prompt) => ({
  label,
  thunk: () => agent(prompt, { label, phase: 'Detect', agentType: 'Explore', model: 'opus', schema: FINDINGS_SCHEMA }),
})
const fields = 'Each finding: category, severity, surface, location (file:line), claim (doc says), reality (code does), proposedFix (described, NOT applied), tags (mechanical|behavioral, uncommitted|committed). Source of truth = the CODE; the doc is what is wrong. None? return empty findings.'
const taskList = []

for (const f of srcCodeFiles) {
  const dir = owningDir(f, docDirs)
  taskList.push(F(`file:${f}`,
    `Doc-sync DETECTION for ONE changed source file. ${READONLY}\nFile: ${f}\nOwning doc-dir: ${dir} (docs: ${dir}/CLAUDE.md, ${dir}/README.md)\n` +
    `Read the file's CURRENT on-disk content and those two doc files. Report every way this file's current state makes the docs wrong. Lens: CLAUDE.md = conventions/sync-rules/gotchas/dependency-direction; README.md = inventory/public exports/"where to add code". ${ROT}\n${fields}`))
}
for (const d of affectedDirs) {
  taskList.push(F(`dir:${d}`,
    `Whole-directory doc check (inventory completeness, orphans — what a single-file pass misses) for a diff-scoped rot sweep. ${READONLY}\nDirectory: ${d} (its code changed in your pile). Read ${d}/CLAUDE.md, ${d}/README.md and the dir's real source files. Find: code files missing from the README inventory (Gap); files/symbols named in docs but gone (Orphan); stale conventions; drifted contracts. ${ROT}\n${fields}`))
}
// Tier-1: SPEC + README — claim-by-claim, pulled in even when unchanged if behaviour changed
const tier1 = (file, reason) => F(`tier1:${file}`,
  `TIER-1 doc check (claim-by-claim) for a diff-scoped rot sweep. ${READONLY}\nDoc: ${file} (${reason}).\nGo CLAIM BY CLAIM: every statement, count, table row, command, setting, language, keybinding, behaviour — verify against the CURRENT code (re-read the relevant src file for any behavioural claim). Report both directions: doc claims not true of code (Stale/Drift) and code behaviour the doc omits (Gap). ${ROT}\n${fields}`)
if (rootDocs.includes('SPEC.md')) taskList.push(tier1('SPEC.md', 'in your diff'))
else if (hasBehaviouralCodeChange) taskList.push(tier1('SPEC.md', 'a behavioural code change can stale it even though you did not edit it'))
if (rootDocs.includes('README.md')) taskList.push(tier1('README.md', 'in your diff'))
else if (hasBehaviouralCodeChange) taskList.push(tier1('README.md', 'a behavioural code change can stale it even though you did not edit it'))
// other root docs (CHANGELOG handled separately below)
for (const f of rootDocs) {
  if (f === 'CLAUDE.md' || f === 'SUPPORT.md') {
    taskList.push(F(`root:${f}`,
      `Root-doc check for a diff-scoped rot sweep. ${READONLY}\nDoc: ${f}. Verify its counts and key claims (architecture, command list, sync rules, supported pairs) against the CURRENT code. ${ROT}\n${fields}`))
  }
}
// docs/ — changed files directly, plus the design criteria as a Tier-1 partner when behaviour changed
for (const f of docsFiles) {
  taskList.push(F(`docs:${f}`,
    `docs/ design-doc check (changed in your pile) for a diff-scoped rot sweep. ${READONLY}\nDoc: ${f}. Verify its claims against the CURRENT code/behaviour it documents (criteria, decisions, rejection ledgers). ${ROT}\n${fields}`))
}
if (hasBehaviouralCodeChange) {
  taskList.push(F('docs:criteria',
    `Design-library (docs/) partner check for a diff-scoped rot sweep. ${READONLY}\nA behavioural code change is in your pile (changed: ${srcCodeFiles.join(', ')}). Find the docs/ design files whose subject those changes touch — primarily docs/import-statements/ (criteria, decisions, rejection ledgers) — and check them claim-by-claim against CURRENT behaviour. Only the RELEVANT docs/ files, never the whole tree. ${ROT}\n${fields}`))
}
// qa/ — changed files directly, plus the relevant checklist(s) as a partner when behaviour changed
for (const f of qaFiles) {
  taskList.push(F(`qa:${f}`,
    `qa/ file check (changed in your pile) for a diff-scoped rot sweep. ${READONLY}\nFile: ${f}. Check it against the code/behaviour it documents AND its qa-doc cascade (the inventory/count tables in qa README/CLAUDE this file feeds, and the 1:1 checklist->workspace fixture pairing). Bounded to this file + its direct cascade targets. ${ROT}\n${fields}`))
}
if (hasBehaviouralCodeChange) {
  taskList.push(F('qa:relevant',
    `qa/ checklist relevance check for a diff-scoped rot sweep. ${READONLY}\nA behavioural code change is in your pile (changed: ${srcCodeFiles.join(', ')}). If it affects a per-language builder or shared behaviour, find ONLY the relevant qa/checklists/ checklist(s) (the affected language(s) + general.md) and check whether they cover the change and whether the qa-doc cascade (inventories, counts, 1:1 fixture pairing) is consistent. NEVER read the whole 12-language tree. If no checklisted behaviour is affected, return empty. ${ROT}\n${fields}`))
}
// cross-site contracts (only the implicated ones; reads all member sites incl. unchanged witnesses)
for (const c of implicated) {
  taskList.push(F(`contract:${c.key}`,
    `Cross-site CONTRACT check a single-file pass cannot see. ${READONLY}\nContract: ${c.desc}\nYour diff touched a member site, so read the CODE at EVERY site (committed sites = witnesses) and the docs that describe it (root CLAUDE.md "Cross-cutting sync rules" + the relevant per-dir docs). Report any doc stale/drifted about the contract, OR the contract itself broken in code (category "Broken invariant" — do NOT edit code). ${ROT}\n${fields}`))
}
// package.json self-check
if (packageJsonChanged) {
  taskList.push(F('package.json',
    `package.json self-check for a diff-scoped rot sweep. ${READONLY}\npackage.json is in your diff. Read it and the src/ that backs it (extension.ts, commands/index.ts, config access). Check contributes (commands, keybindings, configuration) vs what is actually registered/read in src/: anything DECLARED but dead in code, or in code but UNDECLARED; and command/setting/keybinding COUNTS vs the docs' stated numbers (e.g. the "seven commands" invariant). ${ROT}\n${fields}`))
}
// CHANGELOG accuracy (propose-only)
if (hasUserFacingChange) {
  taskList.push(F('changelog',
    `CHANGELOG accuracy check for a diff-scoped rot sweep. ${READONLY}\nRead CHANGELOG.md's "## [Unreleased]" section and the uncommitted change set (git diff of the working tree; new/changed commands, settings, behaviours, fixes). Changed: ${paths.join(', ')}.\nTriage the pile's USER-FACING changes vs Unreleased: Gap = a user-facing change Unreleased omits -> propose the exact Added/Changed/Fixed bullet; Stale = an Unreleased bullet that misstates current behaviour -> propose the correction. Never touch published version sections. Propose only. surface = "CHANGELOG.md".\n${fields}`))
}
// interconnection (registration tables + cross-doc links) on any structural change
if (hasStructural) {
  taskList.push(F('interconnect',
    `Interconnection check (registration tables + cross-doc links) for a diff-scoped rot sweep. ${READONLY}\nYour pile adds/deletes/renames a file or dir, which can rot the doc web. Live doc-dir set: ${docDirs.join(', ')}. Changed: ${changed.map(c => c.status + ' ' + c.path).join(', ')}.\nCheck registration sites — root CLAUDE.md "Subdirectory guides" table, src/README.md, src/CLAUDE.md: a row pointing at a renamed/removed dir = Orphan (high-confidence); a live dir absent from a table = Gap (ADVISORY — tables are curated, only flag a dir that clearly belongs). Verify relative [text](path) and [[name]] links in the changed docs resolve to real files (broken target = Orphan). For an untracked new file (e.g. README.draft.md), check whether anything references it (unreferenced = Orphan/advisory). ${ROT}\n${fields}`))
}

log(`Uncommitted: ${paths.length} paths -> ${srcCodeFiles.length} src-code, ${affectedDirs.length} src-dirs, ${rootDocs.length} root-docs, ${docsFiles.length} docs/, ${qaFiles.length} qa/, ${implicated.length} contracts${packageJsonChanged ? ', package.json' : ''}. ${taskList.length} finder agents.`)

// ---------- Phase 2: Detect ----------
phase('Detect')
const detection = await runBatched(taskList.map(t => t.thunk), 6, 'Detect')
const raw = detection.filter(Boolean).flatMap(r => r.findings || [])
const seen = new Set()
const deduped = []
for (const f of raw) {
  const k = [ f.surface, f.category, (f.claim || '').slice(0, 80) ].join('|')
  if (!seen.has(k)) { seen.add(k); deduped.push(f) }
}
log(`Detection: ${raw.length} raw -> ${deduped.length} deduped findings`)

// ---------- Phase 3: Verify (single-lens, refute-by-default) ----------
phase('Verify')
const verified = await runBatched(deduped.map(f => () =>
  agent(
    `Adversarially verify ONE diff-scoped rot finding by re-reading the actual files. ${READONLY}\n` +
    `Surface: ${f.surface} [${f.category}]. Doc claims: "${f.claim}". Reality (code): "${f.reality}". Proposed fix: "${f.proposedFix}".\n` +
    `Default real=false unless the evidence clearly holds. Re-read the actual doc location AND the actual code. Is this a REAL inconsistency worth reporting? Return real, reason, refinedFix (tightened fix, or empty).`,
    { label: `verify:${f.category}:${f.surface}`, phase: 'Verify', agentType: 'Explore', model: 'opus', schema: VERDICT_SCHEMA }
  )
), 6, 'Verify')
const confirmed = []
verified.forEach((v, i) => {
  if (v && v.real) confirmed.push({ ...deduped[i], refinedFix: (v.refinedFix || deduped[i].proposedFix) })
})
log(`Confirmed ${confirmed.length}/${deduped.length} after verify`)

// ---------- Phase 4: Complete (coverage manifest) ----------
phase('Complete')
const manifest = await agent(
  `Completeness critic + COVERAGE MANIFEST for a diff-scoped rot sweep. ${READONLY}\n` +
  `Uncommitted set: ${paths.join(', ')}.\nFinder targets that ran: ${taskList.map(t => t.label).join(', ')}.\n${confirmed.length} findings confirmed.\n` +
  `Produce a FACTUAL manifest: read (files actually opened — diff subjects + pulled-in witnesses), checked (surfaces audited), skipped (in-scope surfaces or implicated contracts NOT covered, with why). Do NOT speculate about unread files; only report what was and was not covered. notes: one line max.`,
  { label: 'coverage-manifest', phase: 'Complete', agentType: 'Explore', model: 'opus', schema: MANIFEST_SCHEMA }
)

// ---------- assemble (report-only; writes nothing — caller persists) ----------
const byCategory = {}
const bySurface = {}
for (const f of confirmed) {
  (byCategory[f.category] = byCategory[f.category] || []).push(f)
  ;(bySurface[f.surface] = bySurface[f.surface] || []).push(f)
}
return {
  mode: 'report',
  scope: { changedFiles: allPaths.length, inScope: paths.length, outOfScope, finderTargets: taskList.length, implicatedContracts: implicated.map(c => c.key) },
  findings: { total: confirmed.length, byCategory, bySurface, items: confirmed },
  coverage: { ...(manifest || { read: [], checked: [], skipped: [], notes: 'manifest agent returned nothing' }), outOfScopeSkipped: outOfScope, fullPassPointer: FULL_PASS_POINTER },
  note: OUT_OF_SCOPE_NOTE,
}
