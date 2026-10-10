// Tells the background worker what's highlighted so the menu can show
// VIN-only options before you right-click.
let lastSent = null;
let timer = null;

function report() {
  const text = String(window.getSelection() || "").trim();
  if (text === lastSent) return;
  lastSent = text;
  try {
    chrome.runtime.sendMessage({ type: "selection", text: text.slice(0, 200) });
  } catch (e) { /* extension reloaded; ignore */ }
}

document.addEventListener("selectionchange", () => {
  clearTimeout(timer);
  timer = setTimeout(report, 120);
});
document.addEventListener("contextmenu", () => { clearTimeout(timer); report(); }, true);
