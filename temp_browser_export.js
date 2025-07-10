class A11yHelper {
  static isFocusTarget(target) {
    return target && target.classList && target.classList.contains;
  }
}

export { A11yHelper, BrowserSupports, ClipboardAccess, CrossWindow, URLParser };
