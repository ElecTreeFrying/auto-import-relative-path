export const meta = {
  name: 'spec-sync',
  description: 'Audit the existing SPEC.md against the code and report (or, in fix mode, apply) gaps and corrections. Full-read opus agent per source file (extract -> verify) + package.json, cross-file contract agents, then per-file/per-contract audit of SPEC.md, adversarial finding-verify. Report-only by default; fix mode edits ONLY SPEC.md.',
  whenToUse: 'Heavy/rare deep audit of SPEC.md completeness & accuracy vs src/. Caller passes args {sourceFiles, mode} (audit agents read the live ./SPEC.md; legacy args.specText is optional/ignored). Defaults to report (no writes). args {mode:"fix"} applies confirmed findings to SPEC.md via a single writer. Never per-commit; complements release-align (the broad release sweep).',
  phases: [
    { title: 'Extract', detail: 'full-read opus agent per source file + package.json (extract -> verify)' },
    { title: 'Contracts', detail: 'one opus agent per cross-file contract' },
    { title: 'Audit', detail: 'check SPEC.md against the code inventory + contracts -> findings' },
    { title: 'Verify', detail: 'adversarial refute-by-default per finding' },
    { title: 'Apply', detail: 'fix mode only: single writer edits SPEC.md' },
  ],
}

// `args` may arrive as an object OR a JSON string — normalise both, and default to the SAFE
// report mode (doc-sync lesson: an args mishap once defaulted a run to fix and edited files).
let a = args
if (typeof a === 'string') { try { a = JSON.parse(a) } catch (e) { a = {} } }
a = a || {}
const sourceFiles = a.sourceFiles || []
const MODE = a.mode === 'fix' ? 'fix' : 'report'
if (!sourceFiles.length) throw new Error('spec-sync: args.sourceFiles is empty — caller must enumerate via git ls-files and pass them in.')
// SPEC.md is read LIVE (./SPEC.md) by the audit agents, not embedded as a 25KB arg — avoids transcription/staleness skew. args.specText is optional and ignored.
log(`spec-sync starting in ${MODE} mode — ${sourceFiles.length} source files + package.json` + (MODE === 'report' ? ' — NO writes (pass args {mode:"fix"} to apply to SPEC.md)' : ' — will edit SPEC.md only'))

// ---------- schemas ----------
const INVENTORY_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['file','exports','functions','variables','types','branches','behaviors','configReads','gating','notifications','edgeCases'],
  properties: {
    file: { type: 'string' },
    exports: { type: 'array', items: { type: 'string' }, description: 'every exported symbol (for package.json: every command/keybinding/setting id)' },
    functions: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['name','what'], properties: { name: { type: 'string' }, what: { type: 'string' } } }, description: 'every function/method incl. private and _-prefixed' },
    variables: { type: 'array', items: { type: 'string' }, description: 'every module-level variable/constant' },
    types: { type: 'array', items: { type: 'string' }, description: 'every type/interface/union declared' },
    branches: { type: 'array', items: { type: 'string' }, description: 'every meaningful branch and what it decides' },
    behaviors: { type: 'array', items: { type: 'string' }, description: 'user-observable behaviors produced' },
    configReads: { type: 'array', items: { type: 'string' }, description: 'settings/config keys read (for package.json: settings declared)' },
    gating: { type: 'array', items: { type: 'string' }, description: 'gating/validation clauses enforced' },
    notifications: { type: 'array', items: { type: 'string' }, description: 'toasts / messages / errors shown' },
    edgeCases: { type: 'array', items: { type: 'string' }, description: 'edge cases handled' },
  },
}
const VERIFY_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['file','accurate','corrections','missed'],
  properties: {
    file: { type: 'string' },
    accurate: { type: 'boolean' },
    corrections: { type: 'array', items: { type: 'string' }, description: 'inventory claims that were wrong, corrected' },
    missed: { type: 'array', items: { type: 'string' }, description: 'symbols/behaviors/branches the inventory missed' },
  },
}
const CONTRACT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['key','title','sites','rule'],
  properties: {
    key: { type: 'string' }, title: { type: 'string' },
    sites: { type: 'array', items: { type: 'string' }, description: 'each participating file/location + its concrete current value' },
    rule: { type: 'string', description: 'the contract exactly as the code enforces it today' },
  },
}
const FINDING = {
  type: 'object', additionalProperties: false,
  required: ['specSection','category','claim','reality','proposedFix'],
  properties: {
    specSection: { type: 'string', description: 'best-matching SPEC.md heading, or "ABSENT — no section"' },
    location: { type: 'string', description: 'quote/line hint in SPEC.md, or "absent"' },
    category: { type: 'string', enum: ['Gap','Stale','Drift','Broken invariant'] },
    severity: { type: 'string', enum: ['high','medium','low'] },
    claim: { type: 'string', description: 'what SPEC.md currently says (empty if absent)' },
    reality: { type: 'string', description: 'what the code/manifest actually does' },
    proposedFix: { type: 'string', description: 'concrete add/replace text for SPEC.md' },
  },
}
const FINDINGS_SCHEMA = { type: 'object', additionalProperties: false, required: ['findings'], properties: { findings: { type: 'array', items: FINDING } } }
const VERDICT_SCHEMA = { type: 'object', additionalProperties: false, required: ['real','reason'], properties: { real: { type: 'boolean' }, reason: { type: 'string' }, refinedFix: { type: 'string' } } }

const READONLY = 'READ-ONLY: do not edit or write any file.'
const ROT = 'Categories: Gap (code has a behavior/symbol/setting SPEC.md does not document), Stale (a SPEC.md claim no longer true), Drift (SPEC.md and code diverged — esp. byte-exact contract values), Broken invariant (a documented invariant/contract is violated in code — report only, never edit code).'

// Audit/Verify run in small sequential waves, NOT one wide parallel() barrier: after ~80 prior agents and
// >1M tokens, a single ~42-wide barrier of large schema prompts throttles the API and agents return prose
// instead of calling StructuredOutput (observed 2026-05-31: 25/43 audit agents failed). Small batches keep
// the instantaneous rate under the throttle. See specs/spec-sync.md (Decisions).
const EXTRACT_BATCH = 6, AUDIT_BATCH = 6, VERIFY_BATCH = 6
async function runBatched(thunks, size, label) {
  const out = []
  for (let i = 0; i < thunks.length; i += size) {
    out.push(...await parallel(thunks.slice(i, i + size)))
    log(`${label} batch ${Math.floor(i / size) + 1}/${Math.ceil(thunks.length / size)} — ${out.filter(Boolean).length}/${out.length} ok`)
  }
  return out
}

// ---------- Phase 1: Extract -> Verify (waves of EXTRACT_BATCH, full-read, opus) ----------
// Batched (NOT a bare pipeline()) for the SAME reason Audit/Verify are: an un-throttled
// continuous pipeline of ~10-14 large schema agents trips the API rate limit on its tail
// (observed 2026-06-04: pipeline[21..36] = 14/37 targets dropped). Small sequential waves
// keep the instantaneous request rate under the throttle. See specs/spec-sync.md (Decisions).
phase('Extract')
const targets = [...sourceFiles, 'package.json']
const perFile = await runBatched(targets.map((file) => async () => {
  const inv = await agent(
    file === 'package.json'
      ? `${READONLY} Read the ENTIRE \`package.json\`. Produce a COMPLETE inventory of the extension's declared surface: every command (id + title), every keybinding (key + when clause), every activationEvent, every configuration setting (key, type, default, enum values), every contributed menu, and anything else user-facing. Record commands/keybindings/settings under both \`exports\` (ids) and \`behaviors\` (what each does). Do NOT skip anything.`
      : `${READONLY} Read the ENTIRE file \`${file}\` top to bottom — every line, not excerpts. Also read its sibling \`CLAUDE.md\`/\`README.md\`. Produce a COMPLETE inventory: every export; every function/method incl. private and \`_\`-prefixed; every module-level variable/constant; every type/interface/union; every meaningful branch; and every user-observable behavior, config/setting read, gating/validation clause, toast/notification/error, and edge case. Do NOT summarize or skip — list a symbol even with no behavioral surface.`,
    { label: `extract:${file}`, phase: 'Extract', model: 'opus', schema: INVENTORY_SCHEMA }
  )
  if (inv == null) return null
  const verify = await agent(
    `${READONLY} Adversarially verify this inventory for \`${file}\` against the actual code/manifest. Re-read it. Confirm every claimed symbol/behavior/branch is real and accurate — refute by default if unsure. Report \`corrections\` (claims that were wrong) and \`missed\` (anything the inventory failed to capture).\n\nInventory: ${JSON.stringify(inv)}`,
    { label: `verify:${file}`, phase: 'Extract', model: 'opus', schema: VERIFY_SCHEMA }
  )
  return { inventory: inv, verify }
}), EXTRACT_BATCH, 'Extract')
const covered = perFile.filter(Boolean)
log(`Extracted + verified ${covered.length}/${targets.length} targets`)

// ---------- Phase 2: Contracts (parallel barrier) ----------
phase('Contracts')
const CONTRACTS = [
  { key: 'four-site-extension', desc: 'Four-site extension sync: types/file-extension.ts (type union) -> constants/extensions.ts (runtime list) -> snippets/dispatch.ts -> snippets/variants.ts.' },
  { key: 'three-site-config', desc: 'Three-site config-enum sync: package.json contributes.configuration enums -> snippets/_styles.ts -> each per-language switch in snippets/languages/. (package.json is outside src/.)' },
  { key: 'two-site-button', desc: 'Two-site button-label sync: toast button labels in editor/notification.ts vs the switch cases in commands/copy-file-path.ts, character-for-character.' },
  { key: 'runtime-type-mirror', desc: 'Runtime-type mirror: IMAGE_FILE_EXTENSIONS mirrors ImageFileExtension; TEXT_TRACK_FILE_EXTENSIONS mirrors TextTrackFileExtension; MEDIA_FILE_EXTENSIONS = video+audio only (.vtt lives in TEXT_TRACK); both spread into destination lists.' },
  { key: 'gating-clauses', desc: 'The full source->destination pair gating in gating.ts (isPairSupported): enumerate every clause that accepts or rejects a pair.' },
  { key: 'layering', desc: 'Dependency-direction / layering rules from src/CLAUDE.md + src/README.md: which layers may import which; the _-prefixed internal modules in snippets/.' },
]
const contracts = (await parallel(CONTRACTS.map(c => () =>
  agent(
    `${READONLY} Document this cross-file contract EXACTLY as the code enforces it today. Read the code at every site. List each site with its concrete current value, and state the rule precisely.\n\nContract: ${c.desc}`,
    { label: `contract:${c.key}`, phase: 'Contracts', model: 'opus', schema: CONTRACT_SCHEMA }
  )
))).filter(Boolean)
log(`Documented ${contracts.length}/${CONTRACTS.length} cross-file contracts`)

// ---------- Phase 3: Audit SPEC.md against the verified inventory + contracts ----------
phase('Audit')
const auditFileThunks = covered.map(c => () =>
  agent(
    `${READONLY} Audit the existing SPEC.md against the VERIFIED ground-truth inventory for \`${c.inventory.file}\`. ${ROT}\n` +
    `For EVERY behavior / command / keybinding / setting / gating clause / notification / edge case in the inventory, check whether SPEC.md documents it, and correctly. Report every Gap (in inventory, missing from SPEC) and every Stale/Drift (SPEC states something the code contradicts). For each: specSection (best-matching SPEC heading or "ABSENT"), location, category, severity, claim (what SPEC says, or empty), reality (from inventory/code), concrete proposedFix. None? return empty findings.\n\n` +
    `Inventory: ${JSON.stringify({ ...c.inventory, _verify: c.verify })}\n\nThe audited document is \`./SPEC.md\` — read it IN FULL (top to bottom) and compare against this inventory.`,
    { label: `audit:${c.inventory.file}`, phase: 'Audit', model: 'opus', schema: FINDINGS_SCHEMA }
  )
)
const auditContractThunks = contracts.map(ct => () =>
  agent(
    `${READONLY} Audit how the existing SPEC.md treats this cross-file contract, against its VERIFIED documentation. ${ROT}\n` +
    `Does SPEC.md describe this contract with the correct concrete values at every site? Report Gaps/Stale/Drift. Finding shape: specSection, location, category, severity, claim, reality, proposedFix.\n\n` +
    `Contract: ${JSON.stringify(ct)}\n\nThe audited document is \`./SPEC.md\` — read it IN FULL and check how it treats this contract.`,
    { label: `audit:contract:${ct.key}`, phase: 'Audit', model: 'opus', schema: FINDINGS_SCHEMA }
  )
)
const auditResults = await runBatched([...auditFileThunks, ...auditContractThunks], AUDIT_BATCH, 'Audit')
const rawFindings = auditResults.filter(Boolean).flatMap(r => r.findings || [])
const seen = new Set(); const deduped = []
for (const f of rawFindings) {
  const k = [f.specSection, f.category, (f.reality || '').slice(0, 80)].join('|')
  if (!seen.has(k)) { seen.add(k); deduped.push(f) }
}
log(`Audit: ${rawFindings.length} raw -> ${deduped.length} deduped findings`)

// ---------- Phase 4: Verify findings (adversarial, refute-by-default) ----------
phase('Verify')
const verified = await runBatched(deduped.map(f => () =>
  agent(
    `${READONLY} Adversarially verify a SPEC.md audit finding. Default real=false unless the evidence clearly holds. Read the actual code AND the cited SPEC.md location.\n` +
    `[${f.category}] SPEC section "${f.specSection}" @ ${f.location || '?'} — claim: "${f.claim}". reality (code): "${f.reality}". proposedFix: "${f.proposedFix}".\n` +
    `Is this a REAL gap/error in SPEC.md that warrants the fix? Return real, reason, refinedFix (tightened, or empty to keep).`,
    { label: `verify:${f.category}`, phase: 'Verify', model: 'opus', schema: VERDICT_SCHEMA }
  ).then(v => (v && v.real) ? { ...f, refinedFix: (v.refinedFix || f.proposedFix), verifyReason: v.reason } : null)
), VERIFY_BATCH, 'Verify')
const confirmed = verified.filter(Boolean)
log(`Confirmed ${confirmed.length}/${deduped.length} findings after adversarial verify`)

// ---------- Reconcile (coverage proof) ----------
const droppedTargets = targets.filter((f, i) => perFile[i] == null)
const auditUnits = [...covered.map(c => c.inventory.file), ...contracts.map(ct => `contract:${ct.key}`)]
const droppedAudits = auditUnits.filter((_, i) => auditResults[i] == null)
if (droppedAudits.length) log(`WARNING: ${droppedAudits.length} audit agent(s) produced nothing (throttle?): ${droppedAudits.join(', ')}`)
const reconciliation = {
  targets: targets.length,
  covered: covered.length,
  dropped: droppedTargets,
  contractsCovered: contracts.length,
  auditUnits: auditUnits.length,
  auditCompleted: auditUnits.length - droppedAudits.length,
  droppedAudits,
  findings: { raw: rawFindings.length, deduped: deduped.length, confirmed: confirmed.length },
  filesFlaggedInaccurate: covered.filter(c => c.verify && c.verify.accurate === false).map(c => c.inventory.file),
}
if (droppedTargets.length) log(`WARNING: ${droppedTargets.length} target(s) produced no inventory: ${droppedTargets.join(', ')}`)

// ---------- Phase 5: Apply (fix mode only — single writer, SPEC.md only) ----------
let applied = null
if (MODE === 'fix' && confirmed.length) {
  phase('Apply')
  const items = confirmed.map((f, i) =>
    `${i + 1}. [${f.category}] ${f.specSection} @ ${f.location || '?'}\n   reality: ${f.reality}\n   fix: ${f.refinedFix}`
  ).join('\n')
  applied = await agent(
    `You are the SINGLE writer for SPEC.md. Apply these confirmed findings by editing ONLY \`SPEC.md\`: add missing behaviors in the right section, correct stale/drifted claims, keep edits minimal and match SPEC.md's existing voice, structure, and table style. Re-read the code to confirm each item before applying; drop any that no longer holds.\n` +
    `HARD RULES: touch ONLY SPEC.md — never code, tests, package.json, other docs, anything under .claude/, or process/.\n\nFindings:\n${items}`,
    { label: 'apply:SPEC.md', phase: 'Apply', schema: { type: 'object', additionalProperties: false, required: ['edited','summary'], properties: { edited: { type: 'boolean' }, summary: { type: 'string' }, sectionsTouched: { type: 'array', items: { type: 'string' } } } } }
  )
}

return {
  mode: MODE,
  reconciliation,
  contracts,
  findings: confirmed,                          // [{specSection, category, claim, reality, refinedFix, ...}] -> caller writes SPEC.audit.md
  inventories: covered.map(c => c.inventory),    // full per-target inventories (coverage evidence)
  applied,                                       // null in report mode
}
