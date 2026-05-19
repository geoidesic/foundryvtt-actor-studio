/**
 * Foundry v12: mirror client theme (body.theme-dark / theme-light) onto Actor Studio app roots.
 * Foundry 13+: no-op — theme is driven by body ancestor selectors and TJS 0.3.
 */

const THEME_DARK = 'theme-dark';
const THEME_LIGHT = 'theme-light';

function isFoundryV12OrEarlier() {
  return typeof game !== 'undefined' && Number(game.version) < 13;
}

function bodyHasExplicitTheme() {
  const body = document.body;
  return body.classList.contains(THEME_DARK) || body.classList.contains(THEME_LIGHT);
}

/**
 * @returns {'dark' | 'light'}
 */
export function resolveFoundryTheme() {
  const body = document.body;
  if (body.classList.contains(THEME_DARK)) return 'dark';
  if (body.classList.contains(THEME_LIGHT)) return 'light';
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
 * @returns {() => void} disconnect (no-op on v13+ or missing element)
 */
export function observeFoundryBodyTheme(elementRoot) {
  if (!elementRoot || !isFoundryV12OrEarlier()) {
    return () => {};
  }

  const sync = () => applyAppTheme(elementRoot, resolveFoundryTheme());
  sync();

  const bodyObserver = new MutationObserver(sync);
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

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
