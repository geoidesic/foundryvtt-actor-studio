# Aura branch (Foundry v11–v12 / dnd5e 3.x)

The `aura` branch is a long-lived integration line for **older Foundry and dnd5e stacks** while `main` tracks current Foundry (v13+) and TyphonJS Svelte (TJS) 0.3.x. Most application code is shared; dependency pins and release mechanics are not.

## Why it exists

- **Foundry v12 + dnd5e 3.3.x** (and v11) need fixes and testing that differ from v14 + dnd5e 5.x on `main` (for example level-up, advancement shape, enrichment).
- **TJS 0.2.x** on `aura` vs **TJS 0.3.0-next.x** on `main` — different application shells, theme handling, and APIs.
- Shipping both stacks from one branch would force lowest-common-denominator dependencies or constant feature flags.

## Branch ↔ dependency matrix

| Branch | Typical Foundry | Typical dnd5e | `@typhonjs-fvtt/runtime` | `@typhonjs-fvtt/standard` |
|--------|-----------------|---------------|--------------------------|---------------------------|
| `main` | 13–14 | 4.x–5.x | `0.3.0-next.4` | `0.3.0-next.4` |
| `aura` | 11–12 | 3.x | `0.2.0` | `0.2.0` |

`module.json` compatibility ranges are currently the same on both branches; the **meaningful split is `package.json` / lockfile pins**, not separate module manifests.

## Keeping manifests distinct during merges

Commit `9bcaf21f` (`chore(aura): keep aura dependency manifests during merges`) added:

```gitattributes
package.json merge=ours
bun.lock merge=ours
```

When merging `main` **into** `aura`, Git keeps **this branch’s** `package.json` and `bun.lock` on conflict (`merge=ours` is from the checked-out branch’s point of view). Code and docs merge from `main`; TyphonJS pins stay on 0.2.0.

After a merge into `aura`, run `bun i` so `node_modules` matches the lockfile (release.js does this for suffix releases).

## Release workflow

`release.js` supports suffix pre-releases (see `d63d98a2`):

```bash
# From main or aura, clean tree:
node release.js --suffix aura
# or: bun run release:aura
```

When started from `main`, the script checks out `aura` and re-runs itself from that branch's `release.js` so release tooling matches the suffix branch.

```bash
# --force is optional; suffix releases auto-replace an existing tag/release
node release.js --suffix aura --force
# or: bun run release:aura:force
```

Behavior:

- Target branch name equals the suffix (`aura`).
- Merges latest `main` into `aura` before tagging (when not `--dry-run`).
- Tag form: `{package.json version}-{suffix}` (e.g. `2.9.5-aura`) — **no semver bump** in `package.json`.
- Skips build/commit steps used for normal releases (suffix flow is tag-oriented).
- Reinstalls dependencies on the suffix branch after merge.
- Re-publishing the same suffix tag automatically deletes the old GitHub release, replaces the tag (force push), and recreates the pre-release so CI runs again.

Normal `main` releases (`patch` / `minor` / `major`) stay on `main` and use TJS 0.3.x.

## Day-to-day workflow

1. **Feature/fix on `main`** when it applies to both lines.
2. **Merge `main` → `aura`** for shared code; resolve conflicts in source, not in `package.json` / `bun.lock` (protected by `.gitattributes`).
3. **Verify on Foundry v12 + dnd5e 3.3.x** on `aura` before a suffix release.
4. **Aura-only fixes** can commit directly on `aura` and optionally cherry-pick to `main` if still relevant.

## Related documentation

- [Foundry v12 theming and dark UI](./foundry_v12_theming.md) — why recent dark-mode CSS/JS changes may not help on `aura`.
- [#254 / v12 level-up](../../) — functional fixes on this branch (separate from theming).

## Git history (reference)

| Commit | Summary |
|--------|---------|
| `d63d98a2` | `release.js` `--suffix` for branch-specific tags |
| `9bcaf21f` | `.gitattributes` `merge=ours` for `package.json` / `bun.lock` |
| `bce257bd` | #254 level-up fixes for Foundry v12 |
