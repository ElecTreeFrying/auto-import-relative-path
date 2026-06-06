// Generated from specs/release-align.md — the spec is the source of truth. If they drift, the doc wins.
export const meta = {
  name: 'release-align',
  description: 'Pre-release consistency gate: read EVERY src/ file to build a complete behaviour inventory, then verify SPEC.md, README.md (Tier-1, claim-by-claim), SUPPORT.md, CLAUDE.md, package.json (self-check) and CHANGELOG.md against it, audit .vscodeignore against the real packaged file list (vsce ls), sweep the rest of root, and emit one consolidated report. Report-only by default; pass args {mode:"fix"} to apply doc-only edits (never package.json).',
  whenToUse: 'Run before a release (or to check drift). Day-to-day per-commit doc upkeep is the doc-sync-auditor agent. Defaults to report-only (no writes); args {mode:"fix"} applies doc-only edits + lets the changelog step write its Unreleased section.',
  phases: [
    { title: 'Ground truth', detail: 'read every src/ file → complete inventory' },
    { title: 'Align', detail: 'each doc vs the inventory (Tier-1 = claim-by-claim)' },
    { title: 'Changelog', detail: 'dispatch the changelog-drafter agent' },
    { title: 'Package', detail: 'vsce ls vs the ship/don\'t-ship policy' },
    { title: 'Root', detail: 'sweep the remaining root files' },
    { title: 'Synthesize', detail: 'verify Tier-1 findings + consolidated report (+ apply in fix mode)' },
  ],
}

// ---------- mode (robust parse; SAFE default = report) ----------
let parsedArgs = args
if (typeof parsedArgs === 'string') {
  try { parsedArgs = JSON.parse(parsedArgs) } catch (e) { parsedArgs = {} }
}
const MODE = (parsedArgs && parsedArgs.mode === 'fix') ? 'fix' : 'report'
log(`release-align starting in ${MODE} mode` + (MODE === 'report' ? ' — NO writes (pass args {mode:"fix"} to apply doc edits)' : ' — will apply doc-only edits; package.json never auto-edited'))

// ---------- schemas ----------
const ENUM_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { files: { type: 'array', items: { type: 'string' } } },
  required: [ 'files' ],
}
const SRC_EXTRACT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    file: { type: 'string' },
    userFacing: { type: 'boolean' },
    commands: { type: 'array', items: { type: 'string' } },
    settings: { type: 'array', items: { type: 'string' } },
    languagesOrPairs: { type: 'array', items: { type: 'string' } },
    behaviours: { type: 'array', items: { type: 'object', additionalProperties: false,
      properties: { desc: { type: 'string' }, userFacing: { type: 'boolean' } }, required: [ 'desc', 'userFacing' ] } },
    notes: { type: 'string' },
  },
  required: [ 'file', 'userFacing', 'behaviours' ],
}
const INVENTORY_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    counts: { type: 'object', additionalProperties: false, properties: {
      commands: { type: 'number' }, settings: { type: 'number' }, languages: { type: 'number' },
      keybindings: { type: 'number' }, dropProviders: { type: 'number' },
      extensions: { type: 'number' }, categories: { type: 'number' },
      engine: { type: 'string' }, version: { type: 'string' } }, required: [ 'commands', 'settings', 'languages' ] },
    commands: { type: 'array', items: { type: 'string' } },
    settings: { type: 'array', items: { type: 'string' } },
    languages: { type: 'array', items: { type: 'string' } },
    behaviours: { type: 'array', items: { type: 'string' } },
    pkgSelfCheck: { type: 'array', items: { type: 'object', additionalProperties: false,
      properties: { kind: { type: 'string' }, detail: { type: 'string' } }, required: [ 'kind', 'detail' ] } },
    notes: { type: 'string' },
  },
  required: [ 'counts', 'commands', 'settings', 'languages', 'behaviours', 'pkgSelfCheck' ],
}
const FINDING = { type: 'object', additionalProperties: false, properties: {
  category: { type: 'string', enum: [ 'Stale', 'Wrong', 'Gap', 'Drift', 'Count-mismatch' ] },
  severity: { type: 'string', enum: [ 'high', 'medium', 'low' ] },
  docLocation: { type: 'string' }, docClaim: { type: 'string' }, reality: { type: 'string' }, proposedFix: { type: 'string' },
}, required: [ 'category', 'docClaim', 'reality', 'proposedFix' ] }
const ALIGN_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { file: { type: 'string' }, tier: { type: 'number' }, findings: { type: 'array', items: FINDING } },
  required: [ 'file', 'findings' ],
}
const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { real: { type: 'boolean' }, reason: { type: 'string' }, refinedFix: { type: 'string' } },
  required: [ 'real', 'reason' ],
}
const VSCODEIGNORE_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    vsceAvailable: { type: 'boolean' },
    shouldNotShipButIncluded: { type: 'array', items: { type: 'string' } },
    shouldShipButMissing: { type: 'array', items: { type: 'string' } },
    verdict: { type: 'string' }, notes: { type: 'string' },
  },
  required: [ 'shouldNotShipButIncluded', 'shouldShipButMissing', 'verdict' ],
}
const ROOT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { findings: { type: 'array', items: { type: 'object', additionalProperties: false,
    properties: { file: { type: 'string' }, issue: { type: 'string' }, proposedFix: { type: 'string' }, severity: { type: 'string' } },
    required: [ 'file', 'issue' ] } } },
  required: [ 'findings' ],
}
const APPLY_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { file: { type: 'string' }, edited: { type: 'boolean' }, summary: { type: 'string' } },
  required: [ 'file', 'summary' ],
}

// ---------- Phase 1: Ground truth — read EVERY src file ----------
phase('Ground truth')
const enumerated = await agent(
  `List every non-test TypeScript file under src/ for this repo. Use git: \`git ls-files 'src/*.ts' 'src/**/*.ts'\`, then EXCLUDE anything under src/test/ or ending in .test.ts. Return the repo-relative paths.`,
  { label: 'enumerate-src', phase: 'Ground truth', agentType: 'Explore', schema: ENUM_SCHEMA }
)
log(`Ground truth: reading ${enumerated.files.length} src files exhaustively`)

const extracts = (await parallel(enumerated.files.map(f => () =>
  agent(
    `Read the FULL file ${f} and report the USER-FACING surface and behaviour it contributes to this VS Code extension. READ-ONLY.\n` +
    `Report: commands it registers; settings it reads; languages/extension-pairs it gates or dispatches; notable user-facing behaviours and edge cases (each flagged userFacing true/false). If the file is purely internal (pure helpers, types, test scaffolding) set userFacing=false and say so in notes. Be faithful to the code — do not infer behaviour that isn't there.`,
    { label: `extract:${f}`, phase: 'Ground truth', agentType: 'Explore', schema: SRC_EXTRACT_SCHEMA }
  )
))).filter(Boolean)

const inventory = await agent(
  `You are building the single canonical inventory of this extension's user-facing surface + behaviour, the source of truth every doc will be checked against.\n` +
  `Inputs: (a) the per-file extracts below, and (b) read package.json's "contributes", "engines", "version", "activationEvents", and keybindings yourself.\n` +
  `Produce: counts (commands, settings, languages, keybindings, dropProviders, extensions, categories, engine, version); the explicit lists of commands/settings/languages; a behaviour catalogue (user-facing behaviours only, deduped, one line each); and pkgSelfCheck findings — anything DECLARED in package.json but dead in code, or present in code but UNDECLARED.\n\n` +
  `Per-file extracts (JSON):\n${JSON.stringify(extracts.map(e => ({ file: e.file, userFacing: e.userFacing, commands: e.commands, settings: e.settings, languagesOrPairs: e.languagesOrPairs, behaviours: e.behaviours })))}`,
  { label: 'synthesize-inventory', phase: 'Ground truth', agentType: 'Explore', schema: INVENTORY_SCHEMA }
)
log(`Inventory: ${inventory.counts.commands} commands, ${inventory.counts.settings} settings, ${inventory.counts.languages} languages, ${inventory.behaviours.length} behaviours, ${inventory.pkgSelfCheck.length} package.json self-check notes`)

// ---------- Phase 2: Align each doc against the inventory ----------
phase('Align')
const INV_JSON = JSON.stringify(inventory)
const DOCS = [
  { file: 'SPEC.md', tier: 1 },
  { file: 'README.md', tier: 1 },
  { file: 'SUPPORT.md', tier: 2 },
  { file: 'CLAUDE.md', tier: 2 },
]
const aligned = (await parallel(DOCS.map(d => () =>
  agent(
    `Check ${d.file} against the canonical inventory below. READ-ONLY.\n` +
    (d.tier === 1
      ? `TIER 1 — highest emphasis. Go CLAIM BY CLAIM: every statement, table row, count, command, setting, language, keybinding, and described behaviour must be verified against the inventory (and re-read the relevant src file if a behavioural claim needs confirming). Report both directions: doc claims not true of the code (Stale/Wrong), and inventory items the doc OMITS (Gap).`
      : `Check counts + key claims against the inventory: commands/settings/languages/keybindings, and any described behaviour. Report Stale/Wrong claims and notable Gaps.`) + `\n` +
    `For each finding: category, severity, docLocation (heading or quote), docClaim, reality (from inventory/code), and a concrete proposedFix. If fully aligned, return an empty findings array.\n\n` +
    `Canonical inventory (JSON):\n${INV_JSON}`,
    { label: `align:${d.file}`, phase: 'Align', agentType: 'Explore', schema: ALIGN_SCHEMA }
  ).then(r => ({ ...r, tier: d.tier }))
))).filter(Boolean)

// ---------- Phase 3: Changelog (reuse the changelog-drafter agent) ----------
phase('Changelog')
const changelog = await agent(
  (MODE === 'report'
    ? `REPORT ONLY — do NOT edit CHANGELOG.md. `
    : `Apply your normal behaviour (you may write the Unreleased section of CHANGELOG.md). `) +
  `Handle both states: if there is no Unreleased section, draft one from commits since the last release tag; if one exists (e.g. "[1.0.0] - Unreleased"), verify it against src/ + commits and merge in anything missing idempotently (never duplicate, never touch published versions). ` +
  (MODE === 'report' ? `Output the proposed draft/merge and which entries are new vs already present.` : ``),
  { label: 'changelog', phase: 'Changelog', agentType: 'changelog-drafter' }
)

// ---------- Phase 4: .vscodeignore packaging audit ----------
phase('Package')
const pkgAudit = await agent(
  `Audit what the VSIX would actually ship. READ-ONLY. Run \`npx @vscode/vsce ls\` (or \`npx vsce ls\`) to list the files that would be packaged; if vsce isn't available, set vsceAvailable=false and fall back to reasoning from .vscodeignore + the repo tree.\n` +
  `Policy — MUST ship: dist/, README.md, CHANGELOG.md, LICENSE.md, package.json, and assets referenced by README. MUST NOT ship: src/, out/, tests, qa*/, process/, .claude/, build configs (tsconfig.json, esbuild.js, eslint.config.mjs, .vscode-test.*), *.ts, *.map, and the GitHub-only docs SPEC.md, SUPPORT.md, CLAUDE.md.\n` +
  `Report: shouldNotShipButIncluded (anything packaged that violates the policy — the user's main worry), shouldShipButMissing (anything required that's absent), and a one-line verdict. Do NOT edit anything.`,
  { label: 'vscodeignore-audit', phase: 'Package', agentType: 'Explore', schema: VSCODEIGNORE_SCHEMA }
)

// ---------- Phase 5: Root sweep ----------
phase('Root')
const rootSweep = await agent(
  `Light finalization sweep of the remaining root files, READ-ONLY: LICENSE.md, tsconfig.json, esbuild.js, eslint.config.mjs, .vscode-test.mjs, package-lock.json. Flag anything stale, wrong, or misplaced before shipping (e.g. wrong license/year, build config inconsistent with package.json scripts, lockfile version out of sync with package.json). Report findings with file, issue, proposedFix, severity. Empty if clean.`,
  { label: 'root-sweep', phase: 'Root', agentType: 'Explore', schema: ROOT_SCHEMA }
)

// ---------- Phase 6: Verify Tier-1 findings + (fix mode) apply ----------
phase('Synthesize')
const tier1Findings = aligned.filter(r => r.tier === 1).flatMap(r => (r.findings || []).map(f => ({ ...f, file: r.file })))
const verifiedTier1 = await parallel(tier1Findings.map(f => () =>
  agent(
    `Adversarially verify this Tier-1 alignment finding. Default real=false unless the evidence clearly holds. Re-read the actual doc location AND the actual code.\n` +
    `In ${f.file} [${f.category}] — doc claims: "${f.docClaim}". Reality: "${f.reality}". Proposed fix: "${f.proposedFix}". Is this a real misalignment worth fixing? Return real, reason, refinedFix.`,
    { label: `verify:${f.file}:${f.category}`, phase: 'Synthesize', agentType: 'Explore', schema: VERDICT_SCHEMA }
  ).then(v => ({ ...f, verified: v }))
))
const confirmedTier1 = verifiedTier1.filter(Boolean).filter(f => f.verified && f.verified.real)

let applied = []
if (MODE === 'fix') {
  // Apply confirmed doc-only edits, one writer per doc file. NEVER package.json.
  const byFile = {}
  for (const r of aligned) {
    if (r.file === 'package.json') continue
    const fs = r.tier === 1
      ? confirmedTier1.filter(x => x.file === r.file).map(x => ({ ...x, proposedFix: (x.verified && x.verified.refinedFix) || x.proposedFix }))
      : (r.findings || [])
    if (fs.length) byFile[r.file] = fs
  }
  applied = (await parallel(Object.keys(byFile).map(file => () => {
    const items = byFile[file].map((f, i) => `${i + 1}. [${f.category}] ${f.docLocation || '?'}\n   claim: ${f.docClaim}\n   reality: ${f.reality}\n   fix: ${f.proposedFix}`).join('\n')
    return agent(
      `You are the SINGLE writer for ${file}. Apply these verified alignment fixes by editing ONLY ${file}. Keep edits minimal and match the file's existing voice. Re-read the code to confirm each before applying; drop any that no longer holds.\n` +
      `HARD RULES: edit ONLY ${file}; never package.json, never code/tests, never .claude/ or process/.\n\nFindings:\n${items}`,
      { label: `apply:${file}`, phase: 'Synthesize', schema: APPLY_SCHEMA }
    )
  }))).filter(Boolean)
}

return {
  mode: MODE,
  inventory: { counts: inventory.counts, behaviours: inventory.behaviours.length, pkgSelfCheck: inventory.pkgSelfCheck },
  alignment: aligned.map(r => ({ file: r.file, tier: r.tier, findings: r.findings })),
  tier1Verified: { raised: tier1Findings.length, confirmed: confirmedTier1.length },
  changelog,
  vscodeignore: pkgAudit,
  rootSweep: rootSweep.findings,
  applied,
  note: MODE === 'report' ? 'Report only — nothing was written. Review, then re-run with args {mode:"fix"} to apply doc edits.' : 'Doc-only edits applied; review via git diff. package.json was NOT auto-edited.',
}
