export function showReloadRequiredConfirm({ world = true } = {}) {
  if (typeof SettingsConfig?.reloadConfirm === 'function') {
    return SettingsConfig.reloadConfirm({ world });
  }

  return Dialog.confirm({
    title: game.i18n.localize('GAS.Dialog.ReloadRequiredTitle'),
    content: `<p>${game.i18n.localize('GAS.Dialog.ReloadRequiredContent')}</p>`,
    yes: () => window.location.reload(),
    no: () => {},
    defaultYes: true
  });
}

export function showSettingsConfirm({ title, content, yes, no, defaultYes = false }) {
  return Dialog.confirm({
    title,
    content,
    yes,
    no,
    defaultYes
  });
}
