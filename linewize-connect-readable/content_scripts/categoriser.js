(() => {
  "use strict";

  !function () {
    chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
      if ("object" == typeof (msg = message) && null != msg && "module" in msg && "categoriser" === msg.module) {
        var msg;
        if ("categoriser/get-page-content" === message.type) {
          const content = function (isFullScreen) {
            var t, n;
            const scanLength = isFullScreen ? 256e3 : 128e3,
              rootTagName = document.documentElement.tagName.toLowerCase();
            if ("html" === rootTagName) return null !== (n = null === (t = document.querySelector("html")) || void 0 === t ? void 0 : t.outerHTML.substring(0, scanLength)) && void 0 !== n ? n : "";
            if ("svg" === rootTagName) {
              const foreignObjects = document.querySelectorAll("foreignObject");
              return Array.from(foreignObjects).map(el => el.outerHTML).join("\n").substring(0, scanLength);
            }
            return document.documentElement.outerHTML.substring(0, scanLength);
          }(message.fullScan);
          return console.log("Sending DOM content to content analyser", content), void sendResponse({
            content: content
          });
        }
        console.error(`unrecognized message type: ${message.type}`);
      }
    });
    const callback = () => {
      "loading" !== document.readyState && (chrome.runtime.sendMessage({
        type: "categoriser/dom-content-loaded"
      }), document.removeEventListener("readystatechange", callback));
    };
    document.addEventListener("readystatechange", callback);
  }();
})();
//# sourceMappingURL=categoriser.bundle.js.map