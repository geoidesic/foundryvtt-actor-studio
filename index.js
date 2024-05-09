const LOG_PREFIX = "Actor Studio";
Hooks.once("ready", (app, html, data) => {
  console.log("[ >> Actor Studio Initialising... << ]");
  console.log("[ >> Actor Studio Initialised << ]");
  CONFIG.debug.hooks = true;
});
function addCreateNewActorButton(html, app) {
  console.info(`${LOG_PREFIX} | Adding Create New Actor button`);
  const $hctButton = $(
    `<button class='dialog-button' data-hct_start>
      ${game.i18n.localize("GAS.ActorsDirectoryButton")}
    </button>`
  );
  $("button", html).after($hctButton);
  $hctButton.on("click", function() {
    alert("o");
  });
}
Hooks.on("renderApplication", (app, html, data) => {
  console.log(html);
  console.log(app);
  const createNewActorLocalized = game.i18n.format("DOCUMENT.Create", { type: game.i18n.localize("DOCUMENT.Actor") });
  if (app.title === createNewActorLocalized) {
    addCreateNewActorButton(html);
  }
});
//# sourceMappingURL=index.js.map
