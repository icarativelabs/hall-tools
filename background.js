// Hall Tools — right-click actions for highlighted text.
importScripts("vin.js");

const INVENTORY_URL = "https://www.hallchryslerjeep.net/all-inventory/index.htm";

function openTab(url, tab) {
  chrome.tabs.create({ url, index: tab ? tab.index + 1 : undefined });
}

const googleSticker = vin =>
  `https://www.google.com/search?q=${encodeURIComponent(`"${vin}" window sticker`)}`;

// ---- Menu setup -------------------------------------------------------------

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    const add = (props) => chrome.contextMenus.create({ contexts: ["selection"], parentId: "hall-tools", ...props });
    chrome.contextMenus.create({ id: "hall-tools", title: "Hall Tools", contexts: ["selection"] });

    add({ id: "search-inventory", title: 'Search Inventory for "%s"' });
    add({ id: "check-recalls", title: 'Check Recalls for "%s"' });

    // VIN-only items: hidden until a VIN is highlighted.
    add({ id: "vin-sep", type: "separator", visible: false });
    add({ id: "vin-sticker", title: "Get Window Sticker", visible: false });
    add({ id: "vin-sticker-search", title: "Search Web for Window Sticker", visible: false });
  });
});

// ---- Show/hide VIN items based on what's highlighted ------------------------

let current = null; // result of analyzeVin for the latest selection

function refreshMenu(text) {
  current = analyzeVin(text);
  const isVin = !!current;
  const upd = (id, props) => chrome.contextMenus.update(id, props, () => void chrome.runtime.lastError);

  upd("vin-sep", { visible: isVin });
  upd("vin-sticker-search", { visible: isVin });

  if (!isVin) {
    upd("vin-sticker", { visible: false });
    return;
  }

  const bits = [current.year, current.maker && current.maker.name].filter(Boolean).join(" ");
  const warn = current.checkOk ? "" : "  ⚠ check digit doesn't match";
  if (current.maker) {
    upd("vin-sticker", { visible: true, title: `Get Window Sticker (${bits})${warn}` });
    upd("vin-sticker-search", { title: "Search Web for Window Sticker" });
  } else {
    // No direct sticker link for this brand — the web search is the option.
    upd("vin-sticker", { visible: false });
    upd("vin-sticker-search", { title: `Search Web for Window Sticker${bits ? ` (${bits})` : ""}${warn}` });
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "selection") refreshMenu(msg.text);
});

// ---- Click handling ---------------------------------------------------------

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const text = (info.selectionText || "").trim().replace(/\s+/g, " ");
  if (!text) return;

  switch (info.menuItemId) {
    case "search-inventory":
      return openTab(`${INVENTORY_URL}?search=${encodeURIComponent(text)}`, tab);

    case "check-recalls":
      return openTab(`https://www.nhtsa.gov/recalls?vymm=${encodeURIComponent(text)}`, tab);

    case "vin-sticker": {
      const a = analyzeVin(text);
      if (!a) return openTab(googleSticker(text), tab);
      return openTab(a.maker ? a.maker.sticker(a.vin) : googleSticker(a.vin), tab);
    }

    case "vin-sticker-search": {
      const a = analyzeVin(text);
      return openTab(googleSticker(a ? a.vin : text), tab);
    }
  }
});
