const init = "";
Hooks.once("ready", (app, html, data) => {
  console.log("Actor Studio");
  alert("b");
  const chatTab = html.find('.chat .tabs .item[data-tab="chat"]');
  const button = $('<button class="my-button">Test Button</button>');
  chatTab.append(button);
  button.on("click", () => {
    alert("Button clicked!");
  });
});
//# sourceMappingURL=index.js.map
