import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const currentProcessStore = { value: null };

vi.mock('svelte/store', () => ({
  get: vi.fn((store) => store?.value ?? null)
}));

vi.mock('~/src/helpers/constants', () => ({
  MODULE_ID: 'foundryvtt-actor-studio'
}));

vi.mock('~/src/helpers/Utility', () => ({
  safeGetSetting: vi.fn((moduleId, key, defaultValue) => {
    if (key === 'forceTakeAverageHitPoints') return true;
    if (key === 'disableAdvancementCapture') return false;
    return defaultValue;
  })
}));

vi.mock('~/src/stores/index.js', () => ({
  dropItemRegistry: {
    currentProcess: currentProcessStore
  },
  preAdvancementSelections: { set: vi.fn() },
  race: { value: null },
  background: { value: null },
  characterClass: { value: null },
  characterSubClass: { value: null }
}));

vi.mock('~/src/components/molecules/dnd5e/Feats/FeatSelector.svelte', () => ({
  default: class MockFeatSelector {}
}));

class JQueryWrapper {
  constructor(elements) {
    this.elements = elements.filter(Boolean);
    this.length = this.elements.length;
    this.elements.forEach((element, index) => {
      this[index] = element;
    });
  }

  [Symbol.iterator]() {
    return this.elements[Symbol.iterator]();
  }

  find(selector) {
    const matches = this.elements.flatMap((element) => Array.from(element.querySelectorAll(selector)));
    return new JQueryWrapper(matches);
  }

  each(callback) {
    this.elements.forEach((element, index) => callback(index, element));
    return this;
  }

  first() {
    return new JQueryWrapper(this.elements.slice(0, 1));
  }

  removeClass() {
    this.elements.forEach((element) => {
      element.className = '';
    });
    return this;
  }

  addClass(className) {
    this.elements.forEach((element) => {
      element.classList.add(...String(className).split(/\s+/).filter(Boolean));
    });
    return this;
  }

  attr(name, value) {
    if (typeof value === 'undefined') {
      return this.elements[0]?.getAttribute(name);
    }

    this.elements.forEach((element) => element.setAttribute(name, value));
    return this;
  }

  appendTo(target) {
    const parent = target instanceof JQueryWrapper ? target[0] : target;
    this.elements.forEach((element) => parent?.appendChild(element));
    return this;
  }

  append(child) {
    const children = child instanceof JQueryWrapper ? child.elements : [child];
    this.elements.forEach((element) => {
      children.forEach((childElement) => {
        element.appendChild(childElement);
      });
    });
    return this;
  }

  trigger(eventName) {
    this.elements.forEach((element) => {
      element.dispatchEvent(new window.Event(eventName, { bubbles: true, cancelable: true }));
    });
    return this;
  }

  off() {
    return this;
  }

  on() {
    return this;
  }

  closest(selector) {
    const matches = this.elements.map((element) => element.closest(selector)).filter(Boolean);
    return new JQueryWrapper(matches);
  }

  parent() {
    const matches = this.elements.map((element) => element.parentElement).filter(Boolean);
    return new JQueryWrapper(matches);
  }

  css() {
    return this;
  }

  prop(name, value) {
    if (typeof value === 'undefined') {
      return this.elements[0]?.[name];
    }

    this.elements.forEach((element) => {
      element[name] = value;
    });
    return this;
  }

  is(selector) {
    if (selector === ':checked') {
      return Boolean(this.elements[0]?.checked);
    }

    return this.elements[0]?.matches?.(selector) ?? false;
  }
}

const ATTRIBUTE_CAMEL_CASE = /-([a-z])/g;

class MockEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = Boolean(options.bubbles);
    this.cancelable = Boolean(options.cancelable);
    this.defaultPrevented = false;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }

  stopPropagation() {}

  stopImmediatePropagation() {}
}

class MockMutationObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {}

  disconnect() {}
}

class MockHTMLElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentElement = null;
    this.attributes = {};
    this.dataset = {};
    this.className = '';
    this.checked = false;
    this.disabled = false;
    this.value = '';
    this.type = '';
    this.name = '';
    this.options = [];
    this._listeners = new Map();
    this.classList = {
      add: (...classes) => {
        const next = new Set(this.className.split(/\s+/).filter(Boolean));
        classes.forEach((cls) => next.add(cls));
        this.className = Array.from(next).join(' ');
        this.attributes.class = this.className;
      }
    };
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  setAttribute(name, value) {
    const normalized = String(value);
    this.attributes[name] = normalized;

    if (name === 'class') {
      this.className = normalized;
    }

    if (name === 'id') {
      this.id = normalized;
    }

    if (name.startsWith('data-')) {
      const key = name.slice(5).replace(ATTRIBUTE_CAMEL_CASE, (_, character) => character.toUpperCase());
      this.dataset[key] = normalized;
    }
  }

  getAttribute(name) {
    return this.attributes[name] ?? null;
  }

  addEventListener(type, handler) {
    const handlers = this._listeners.get(type) ?? [];
    handlers.push(handler);
    this._listeners.set(type, handlers);
  }

  removeEventListener(type, handler) {
    const handlers = this._listeners.get(type) ?? [];
    this._listeners.set(type, handlers.filter((current) => current !== handler));
  }

  dispatchEvent(event) {
    const handlers = this._listeners.get(event.type) ?? [];
    handlers.forEach((handler) => handler.call(this, event));
    return !event.defaultPrevented;
  }

  closest(selector) {
    let current = this;
    while (current) {
      if (matchesSelector(current, selector)) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  querySelectorAll(selector) {
    return querySelectorAllFrom(this, selector);
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  matches(selector) {
    return matchesSelector(this, selector);
  }
}

const parseSelectorTokens = (selector) => selector.trim().split(/\s+/).filter(Boolean);

const collectDescendants = (element) => {
  const descendants = [];
  for (const child of element.children) {
    descendants.push(child);
    descendants.push(...collectDescendants(child));
  }
  return descendants;
};

const matchesSimpleSelector = (element, selector) => {
  const normalized = selector.replace(/^>/, '').trim();
  if (!normalized) return false;

  const idMatches = normalized.match(/#([a-zA-Z0-9_-]+)/g) ?? [];
  if (idMatches.length > 0) {
    const expectedId = idMatches[idMatches.length - 1].slice(1);
    if (element.id !== expectedId) return false;
  }

  const classMatches = normalized.match(/\.([a-zA-Z0-9_-]+)/g) ?? [];
  if (classMatches.length > 0) {
    const classes = new Set((element.className || '').split(/\s+/).filter(Boolean));
    if (!classMatches.every((match) => classes.has(match.slice(1)))) {
      return false;
    }
  }

  const tagMatch = normalized.match(/^[a-zA-Z][a-zA-Z0-9-]*/);
  if (tagMatch && element.tagName !== tagMatch[0].toUpperCase()) {
    return false;
  }

  const attrRegex = /\[([^=\]]+)(?:="([^"]*)")?\]/g;
  let attrMatch;
  while ((attrMatch = attrRegex.exec(normalized))) {
    const [, attrName, expectedValue] = attrMatch;
    const actualValue = element.getAttribute(attrName);
    if (typeof expectedValue === 'string') {
      if (actualValue !== expectedValue) return false;
    } else if (actualValue == null) {
      return false;
    }
  }

  return true;
};

const matchesSelector = (element, selector) => {
  const selectors = selector.split(',').map((part) => part.trim()).filter(Boolean);
  return selectors.some((singleSelector) => {
    const tokens = parseSelectorTokens(singleSelector);
    if (tokens.length === 0) return false;

    let current = element;
    for (let index = tokens.length - 1; index >= 0; index--) {
      if (!current || !matchesSimpleSelector(current, tokens[index])) {
        return false;
      }
      current = current.parentElement;
    }
    return true;
  });
};

const querySelectorAllFrom = (root, selector) => {
  const selectors = selector.split(',').map((part) => part.trim()).filter(Boolean);
  const descendants = collectDescendants(root);
  return descendants.filter((element) => selectors.some((singleSelector) => matchesSelector(element, singleSelector)));
};

const createDocument = () => {
  const body = new MockHTMLElement('body');

  return {
    body,
    createElement: (tagName) => new MockHTMLElement(tagName),
    querySelectorAll: (selector) => querySelectorAllFrom(body, selector),
    querySelector: (selector) => querySelectorAllFrom(body, selector)[0] ?? null
  };
};

describe('forceTakeAverageHitPoints level-up fallback', () => {
  beforeEach(() => {
    const document = createDocument();
    const actorStudioRoot = document.createElement('div');
    actorStudioRoot.setAttribute('id', 'foundryvtt-actor-studio-pc-sheet');
    const windowContent = document.createElement('div');
    windowContent.setAttribute('class', 'window-content');
    const main = document.createElement('main');
    const section = document.createElement('section');
    section.setAttribute('class', 'a');
    const tabContent = document.createElement('div');
    tabContent.setAttribute('class', 'tab-content');
    const content = document.createElement('div');
    content.setAttribute('class', 'content');
    tabContent.appendChild(content);
    section.appendChild(tabContent);
    main.appendChild(section);
    windowContent.appendChild(main);
    actorStudioRoot.appendChild(windowContent);
    document.body.appendChild(actorStudioRoot);

    global.document = document;
    global.window = {
      document,
      Event: MockEvent,
      HTMLElement: MockHTMLElement,
      MutationObserver: MockMutationObserver
    };
    global.HTMLElement = MockHTMLElement;
    global.Event = MockEvent;
    global.MutationObserver = MockMutationObserver;

    global.window.GAS = {
      dnd5eVersion: 4,
      log: {
        d: vi.fn(),
        w: vi.fn(),
        e: vi.fn()
      }
    };

    global.ui = {
      notifications: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn()
      }
    };

    global.game = {
      settings: {
        get: vi.fn()
      }
    };

    global.$ = vi.fn((input) => {
      if (typeof input === 'string') {
        return new JQueryWrapper(Array.from(document.querySelectorAll(input)));
      }

      if (input instanceof JQueryWrapper) {
        return input;
      }

      if (input instanceof MockHTMLElement) {
        return new JQueryWrapper([input]);
      }

      return new JQueryWrapper([]);
    });

    const advancementRoot = document.createElement('div');
    const form = document.createElement('form');
    const averageRadio = document.createElement('input');
    const rollButton = document.createElement('button');
    averageRadio.type = 'radio';
    averageRadio.name = 'hp-choice';
    averageRadio.value = 'average';
    averageRadio.setAttribute('type', 'radio');
    averageRadio.setAttribute('name', 'hp-choice');
    averageRadio.setAttribute('value', 'average');
    rollButton.setAttribute('type', 'button');
    rollButton.setAttribute('data-action', 'roll');
    rollButton.textContent = 'Roll';
    form.appendChild(averageRadio);
    form.appendChild(rollButton);
    advancementRoot.appendChild(form);

    currentProcessStore.value = {
      id: 'levelup-hp-process',
      app: {
        element: advancementRoot,
        step: {
          flow: {
            advancement: {
              type: 'ScaleValue',
              title: 'Class Advancement',
              hint: 'Choose how to apply your level increase'
            }
          }
        }
      }
    };
  });

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    currentProcessStore.value = null;
    delete global.$;
    delete global.game;
    delete global.ui;
    delete global.document;
    delete global.window;
    delete global.HTMLElement;
    delete global.Event;
    delete global.MutationObserver;
  });

  it('selects average HP during level-up when controls exist but metadata is not HP-specific', async () => {
    const module = await import('../hooks/captureAdvancement.js');

    module.captureAdvancement();

    const averageRadio = document.querySelector('input[type="radio"][value="average"]');
    const advancementRoot = currentProcessStore.value.app.element;
    const rollButton = document.querySelector('button[data-action="roll"]');
    expect(averageRadio).toBeTruthy();
    expect(rollButton).toBeTruthy();
    expect(averageRadio.checked).toBe(true);
    expect(window.GAS.log.d).toHaveBeenCalledWith('[forceTakeAverageHitPoints] proceeding via control-detection fallback');

    const rollClickEvent = new MockEvent('click', { bubbles: true, cancelable: true });
    rollClickEvent.target = rollButton;
    advancementRoot.gasForceAverageClickHandler(rollClickEvent);

    expect(rollClickEvent.defaultPrevented).toBe(true);
    expect(ui.notifications.error).toHaveBeenCalledWith('The Game Master has disabled this choice.');
  });

  it('supports the v14 dnd5e 5.3 useAverage checkbox element', async () => {
    const document = createDocument();
    global.document = document;
    global.window.document = document;

    const actorStudioRoot = document.createElement('div');
    actorStudioRoot.setAttribute('id', 'foundryvtt-actor-studio-pc-sheet');
    const windowContent = document.createElement('div');
    windowContent.setAttribute('class', 'window-content');
    const main = document.createElement('main');
    const section = document.createElement('section');
    section.setAttribute('class', 'a');
    const tabContent = document.createElement('div');
    tabContent.setAttribute('class', 'tab-content');
    const content = document.createElement('div');
    content.setAttribute('class', 'content');
    tabContent.appendChild(content);
    section.appendChild(tabContent);
    main.appendChild(section);
    windowContent.appendChild(main);
    actorStudioRoot.appendChild(windowContent);
    document.body.appendChild(actorStudioRoot);

    global.$ = vi.fn((input) => {
      if (typeof input === 'string') {
        return new JQueryWrapper(Array.from(document.querySelectorAll(input)));
      }

      if (input instanceof JQueryWrapper) {
        return input;
      }

      if (input instanceof MockHTMLElement) {
        return new JQueryWrapper([input]);
      }

      return new JQueryWrapper([]);
    });

    window.GAS.dnd5eVersion = 5.3;

    const advancementRoot = document.createElement('div');
    const useAverageCheckbox = document.createElement('dnd5e-checkbox');
    const rollButton = document.createElement('button');
    useAverageCheckbox.setAttribute('name', 'useAverage');
    useAverageCheckbox.setAttribute('id', 'app-actor-test-advancement-useAverage');
    rollButton.setAttribute('type', 'button');
    rollButton.setAttribute('data-action', 'roll');
    advancementRoot.appendChild(useAverageCheckbox);
    advancementRoot.appendChild(rollButton);

    currentProcessStore.value = {
      id: 'levelup-hp-process-v14',
      app: {
        element: advancementRoot,
        step: {
          flow: {
            advancement: {
              type: 'ScaleValue',
              title: 'Class Advancement',
              hint: 'Choose how to apply your level increase'
            }
          }
        }
      }
    };

    const module = await import('../hooks/captureAdvancement.js');
    module.captureAdvancement();

    expect(useAverageCheckbox.checked).toBe(true);
    expect(useAverageCheckbox.getAttribute('checked')).toBe('checked');
  });
});
