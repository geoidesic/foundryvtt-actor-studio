<script>
  import { getContext } from 'svelte';
  import { TJSDialog } from '@typhonjs-fvtt/runtime/svelte/application';
  import CRRetargeter from '~/src/helpers/CRRetargeter';
  import { CRCalculator } from '~/src/helpers/CRCalculator.js';
  import { onDestroy } from 'svelte';
  import { ensureNumberCR } from '~/src/lib/cr.js';
  export let initialCR = 1;
  export let hp = 0;
  export let ac = 10;
  export let xp = 0;
  export let affected = 0; // optional initial value
  export let summary = ''; // optional initial value
  // Optional full update patch calculated by CRRetargeter
  export let updates = null;
  // Parent callback to signal target chosen and updates ready
  export let onReady = null;

  let error = '';
  let applying = false;
  let editingCR = false;
  let targetCR = null; // numeric
  const crOptions = Array.from({ length: 31 }, (_, i) => i); // 0..30
  let displayHp = hp;
  let displayAc = ac;
  let displayXp = xp;
  // Avoid complex expressions in template attributes
  $: crSelectValue = String((typeof targetCR === 'number' && Number.isFinite(targetCR)) ? targetCR : ensureNumberCR(initialCR, 0));

  // actor store comes from parent app context
  const actorStore = getContext('#doc');
  let actorDoc;
  const unsub = actorStore?.subscribe ? actorStore.subscribe(a => actorDoc = a) : null;
  if (unsub) onDestroy(unsub);

  // Prepare a list of per-item diffs from the flat updates patch
  // Each diff: { itemIndex, label, path, before, after }
  $: diffs = [];
  function prettyPath(path) {
    // turn items.3.system.damage.base.number -> items[3] damage.base.number
    return String(path).replace(/items\.(\d+)\./g, (m, idx) => `items[${idx}].`);
  }

  $: if (updates && actorDoc) {
    diffs = [];
    for (const key of Object.keys(updates)) {
      // we only care about item-level updates or system.details
      if (key.startsWith('items.')) {
        const m = /^items\.(\d+)\.(.+)$/.exec(key);
        if (!m) continue;
        const idx = Number(m[1]);
        const sub = m[2];
        const item = actorDoc.items && actorDoc.items[idx] ? actorDoc.items[idx] : null;
        const before = item ? getAtPath(item, sub) : undefined;
        const after = updates[key];
        const label = item ? (item.name || `Item ${idx}`) : `Item ${idx}`;
        diffs.push({ itemIndex: idx, label, path: sub, before, after });
      } else if (key.startsWith('system.')) {
        const before = getAtPath(actorDoc, key.replace(/^system\./, 'system.'));
        diffs.push({ itemIndex: -1, label: 'Actor', path: key, before, after: updates[key] });
      }
    }
    // sort by itemIndex then path
    diffs.sort((a, b) => (a.itemIndex - b.itemIndex) || String(a.path).localeCompare(b.path));
  }

  function getAtPath(obj, path) {
    if (!obj) return undefined;
    const parts = String(path).split('.');
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  function pick(obj, key, fallback) {
    return (obj && Object.prototype.hasOwnProperty.call(obj, key)) ? obj[key] : fallback;
  }

  function buildSummary(cr, hpVal, acVal, xpVal, affectedCount) {
    const xpText = (xpVal?.toLocaleString?.() ?? xpVal);
    return `
      <div class="gas-retarget">
        <p>Set CR to <strong>${CRCalculator.formatCR(cr)}</strong> (XP ${xpText}).</p>
        <ul>
          ${hpVal ? `<li>HP → ${hpVal}</li>` : ''}
          ${acVal ? `<li>AC → ${acVal}</li>` : ''}
          <li>Damage dice adjusted on ~${affectedCount} action/spell${affectedCount === 1 ? '' : 's'} to match target DPR.</li>
        </ul>
        <p>Apply these changes?</p>
      </div>`;
  }

  async function onCRSelected(newCR) {
    error = '';
  // Coerce and validate CR using ensureNumberCR
  targetCR = ensureNumberCR(newCR, NaN);
  if (!Number.isFinite(targetCR)) { error = 'Invalid CR'; return; }
    if (!actorDoc) { error = 'No actor available'; return; }
    try {
      updates = await CRRetargeter.computeUpdates(actorDoc, targetCR);
      // Update displayed stats from updates
      displayHp = pick(updates, 'system.attributes.hp.max', hp);
      displayAc = pick(updates, 'system.attributes.ac.value', ac);
      displayXp = pick(updates, 'system.details.xp.value', xp);
      // Compute affected count
      const itemKeys = Object.keys(updates).filter(k => k.startsWith('items.'));
      const affectedSet = new Set(
        itemKeys
          .filter(k => /\.damage\.|\.activities\.|damage\.parts/.test(k))
          .map(k => k.split('.')[1])
      );
      affected = affectedSet.size;
      summary = buildSummary(targetCR, displayHp, displayAc, displayXp, affected);
      // Notify parent to enable Apply button
      if (typeof onReady === 'function') {
        onReady({ targetCR, updates, hp: displayHp, ac: displayAc, xp: displayXp, affected, summary });
      }
    } catch (err) {
      console.error('CRRetargetDialog computeUpdates error', err);
      error = 'Failed to calculate adjustments';
    }
  }
</script>

<template lang="pug">
.gas-retarget-dialog
  .gas-title-bar
    .gas-title-left
      .gas-cr-badge
        +if("!editingCR")
          button.gas-cr-number(type="button" tabindex="0" on:click!="{() => editingCR = true}" on:keydown!="{(e) => e.key === 'Enter' && (editingCR = true)}" title="Click to set target CR") {initialCR}
          +else()
            select.gas-cr-select(
              value="{crSelectValue}"
              on:change!="{(e) => { editingCR = false; onCRSelected(Number(e.target.value)); }}"
            )
              +each("crOptions as c")
                option(value="{c}") {c}
        .gas-cr-label Current CR
    .gas-title-center
      .gas-stats
        .gas-stat HP: {displayHp}
        .gas-stat AC: {displayAc}
    .gas-title-right
      .gas-xp-value {displayXp} XP

  .gas-body
    p.summary !{summary}
    if diffs && diffs.length
      .gas-diff-list
        each diff in diffs
          .gas-diff-entry
            if diff.itemIndex >= 0
              .gas-diff-item-name {diff.label}
            else
              .gas-diff-item-name Actor
            .gas-diff-path {prettyPath(diff.path)}
            .gas-diff-values
              .gas-diff-before {String(diff.before)}
              .gas-diff-arrow →
              .gas-diff-after {String(diff.after)}
    else
      p.no-diffs No item-level changes detected.
    if error
      .gas-error {error}
    .gas-hint-row
      span.hint ~ {affected} action(s) will be adjusted
</template>

<style lang="sass">
.gas-retarget-dialog
  font-size: 13px

.gas-title-bar
  display: flex
  align-items: center
  justify-content: space-between
  gap: 8px
  padding: 8px 10px
  border-radius: 6px
  background: linear-gradient(90deg, rgba(20,20,40,0.95), rgba(50,15,30,0.9))
  color: #fff

.gas-cr-badge
  width: 64px
  height: 64px
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  border-radius: 8px
  background: rgba(255,255,255,0.03)

.gas-cr-number
  font-weight: 700
  font-size: 22px

.gas-body
  padding: 10px

.gas-hint-row
  margin-top: 6px

.gas-cr-select
  width: 72px
  padding: 2px 4px

.gas-error
  color: var(--color-negative, #c62828)
  margin-top: 8px

.gas-diff-list
  margin-top: 10px
  max-height: 220px
  overflow: auto
  border-top: 1px solid rgba(255,255,255,0.04)
  padding-top: 8px

.gas-diff-entry
  padding: 6px 0
  border-bottom: 1px dashed rgba(255,255,255,0.02)
  display: flex
  flex-direction: column

.gas-diff-item-name
  font-weight: 600
  font-size: 12px

.gas-diff-path
  font-size: 11px
  color: rgba(255,255,255,0.7)
  margin-bottom: 4px

.gas-diff-values
  display: flex
  align-items: center
  gap: 8px
  font-family: monospace
  font-size: 13px

.gas-diff-before, .gas-diff-after
  color: #fff

.gas-diff-arrow
  color: rgba(255,255,255,0.6)

.no-diffs
  color: rgba(255,255,255,0.7)
  font-size: 13px
</style>
