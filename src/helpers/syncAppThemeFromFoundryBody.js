/**
 * Mirror Foundry client theme (body / documentElement) onto Actor Studio app roots.
 * Required while on TJS 0.2 — runtime does not apply theme-dark / theme-light to app shells.
 * When upgrading to TJS 0.3+, this can become a no-op if the runtime mirrors body theme.
 */

const THEME_DARK = 'theme-dark';
const THEME_LIGHT = 'theme-light';

/** @returns {HTMLElement[]} */
function themeRoots() {
  const roots = [document.body, document.documentElement];
  return roots.filter(Boolean);
}

function bodyHasExplicitTheme() {
  return themeRoots().some(
    (el) => el.classList.contains(THEME_DARK) || el.classList.contains(THEME_LIGHT),
  );
}

/**
 * @returns {'dark' | 'light'}
 */
export function resolveFoundryTheme() {
  for (const el of themeRoots()) {
    if (el.classList.contains(THEME_DARK)) return 'dark';
    if (el.classList.contains(THEME_LIGHT)) return 'light';
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) {
    return 'dark';
  }
  return 'light';
}

/**
 * @param {HTMLElement | null | undefined} elementRoot
 * @param {'dark' | 'light'} theme
 */
export function applyAppTheme(elementRoot, theme) {
  if (!elementRoot) return;
  elementRoot.classList.add('themed');
  if (theme === 'dark') {
    elementRoot.classList.add(THEME_DARK);
    elementRoot.classList.remove(THEME_LIGHT);
  } else {
    elementRoot.classList.add(THEME_LIGHT);
    elementRoot.classList.remove(THEME_DARK);
  }
}

/**
 * @param {HTMLElement | null | undefined} elementRoot
 * @returns {() => void} disconnect
 */
export function observeFoundryBodyTheme(elementRoot) {
  if (!elementRoot) {
    return () => {};
  }

  const sync = () => applyAppTheme(elementRoot, resolveFoundryTheme());
  sync();

  const bodyObserver = new MutationObserver(sync);
  for (const root of themeRoots()) {
    bodyObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
  }

  let mediaQuery = null;
  let onMediaChange = null;
  if (!bodyHasExplicitTheme() && typeof window !== 'undefined' && window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    onMediaChange = () => {
      if (!bodyHasExplicitTheme()) sync();
    };
    mediaQuery.addEventListener('change', onMediaChange);
  }

  return () => {
    bodyObserver.disconnect();
    if (mediaQuery && onMediaChange) {
      mediaQuery.removeEventListener('change', onMediaChange);
    }
  };
}
