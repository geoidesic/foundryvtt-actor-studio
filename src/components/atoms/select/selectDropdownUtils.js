export function toFiniteNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function getExternalApplication(getContext) {
  try {
    return getContext('#external')?.application ?? null;
  } catch (e) {
    return null;
  }
}

export function subscribeToPositionStores(application, onPositionUpdate) {
  const unsubs = [];

  const topStore = application?.position?.stores?.top;
  if (topStore?.subscribe) {
    unsubs.push(topStore.subscribe((value) => {
      onPositionUpdate('top', toFiniteNumber(value));
    }));
  }

  const heightStore = application?.position?.stores?.height;
  if (heightStore?.subscribe) {
    unsubs.push(heightStore.subscribe((value) => {
      onPositionUpdate('height', toFiniteNumber(value));
    }));
  }

  return () => {
    for (const unsub of unsubs) {
      if (typeof unsub === 'function') unsub();
    }
  };
}

export function calculateDropdownMaxHeight({ containerEl, application, appTop, appHeight, minHeight = 40, spacing = 8 }) {
  if (!containerEl) return minHeight;

  const selectRect = containerEl.getBoundingClientRect();
  let bottomBoundary = window.innerHeight;

  try {
    if (appTop !== null && appHeight !== null) {
      bottomBoundary = appTop + appHeight;
    }

    const appEl = application?.elementRoot ?? application?.element?.[0];
    if (appEl) {
      const appRect = appEl.getBoundingClientRect();
      const resolvedAppTop = appTop ?? appRect.top;
      const selectBottomInApp = selectRect.bottom - resolvedAppTop;
      const footerEl = appEl.querySelector('section.b');
      const footerTopInApp = footerEl
        ? (footerEl.getBoundingClientRect().top - resolvedAppTop)
        : (appHeight ?? appRect.height);

      const availableInApp = footerTopInApp - selectBottomInApp - spacing;
      return Math.max(minHeight, availableInApp);
    }
  } catch (e) {}

  const available = bottomBoundary - selectRect.bottom - spacing;
  return Math.max(minHeight, available);
}

export function isClickOutsideContainer(event, containerElement) {
  try {
    const targetElement = event.target;

    if (targetElement === containerElement) {
      return false;
    }

    if (!containerElement) {
      console.warn('[IconSelect] containerElement is null, treating as click outside');
      return true;
    }

    if (!targetElement) {
      console.warn('[IconSelect] targetElement is null, treating as click outside');
      return true;
    }

    return !containerElement.contains(targetElement);
  } catch (error) {
    console.error('[IconSelect] Error in isClickOutsideContainer:', error);
    return true;
  }
}
