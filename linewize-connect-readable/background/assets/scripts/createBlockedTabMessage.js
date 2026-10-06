"use strict";

var __webpack_modules__ = {
    180: (e, n, a) => {
      a.d(n, {
        e: () => fadeOutSide,
        j: () => fadeInSide
      });
      const fadeInSide = function (divElement) {
          divElement && setTimeout(() => {
            divElement.style.marginLeft = "0", divElement.style.backgroundColor = "rgba(74,74,74,0.95)";
          }, 500);
        },
        fadeOutSide = function (divElement) {
          divElement && (divElement.addEventListener("transitionend", () => {
            divElement.remove();
          }, !1), divElement.style.marginLeft = "100%", divElement.style.opacity = "0");
        };
    }
  },
  __webpack_module_cache__ = {};
function __webpack_require__(moduleId) {
  var cachedModule = __webpack_module_cache__[moduleId];
  if (void 0 !== cachedModule) return cachedModule.exports;
  var module2 = __webpack_module_cache__[moduleId] = {
    exports: {}
  };
  return __webpack_modules__[moduleId](module2, module2.exports, __webpack_require__), module2.exports;
}
__webpack_require__.d = (exports2, definition) => {
  for (var key in definition) __webpack_require__.o(definition, key) && !__webpack_require__.o(exports2, key) && Object.defineProperty(exports2, key, {
    enumerable: !0,
    get: definition[key]
  });
}, __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
var __webpack_exports__ = {},
  _addFadeFunctions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(180);
!function () {
  var e;
  if (null != document.getElementById("linewize-message-container")) {
    const message_container = document.getElementById("linewize-message-container"),
      divElement = document.createElement("div"),
      messageElementId = "blocked-tab-" + window.lwMsgingBlockedTabId,
      messageDuration = 3e5;
    divElement.id = messageElementId, divElement.className = "message-element", divElement.className += " LinewizeMessageElement LinewizeMessageElement--new", document.createElement("div").className = "LinewizeMessageElement_time";
    const faviconElement = document.createElement("img");
    faviconElement.src = null !== (e = window.lwMsgingTabFavicon) && void 0 !== e ? e : "", faviconElement.className += "LinewizeCloseTabMessage_favicon";
    const closeTabMessageFaviconContainer = document.createElement("div");
    closeTabMessageFaviconContainer.className += "LinewizeCloseTabMessage_faviconContainer", closeTabMessageFaviconContainer.appendChild(faviconElement);
    const messageElement = document.createElement("span");
    messageElement.className = "LinewizeCloseTabMessage_text", messageElement.innerHTML = "Tab was closed when your teacher blocked it";
    const closeElement = document.createElement("img");
    closeElement.src = chrome.runtime.getURL("/background/assets/imgs/Close.svg"), closeElement.onclick = function () {
      divElement.remove();
    }, closeElement.className = "LinewizeCloseTabMessage_closeButton";
    const closeTabContent = document.createElement("div");
    closeTabContent.className = "LinewizeCloseTabMessage_content", closeTabContent.appendChild(closeTabMessageFaviconContainer), closeTabContent.appendChild(messageElement), closeTabContent.appendChild(closeElement), divElement.appendChild(closeTabContent), message_container && message_container.appendChild(divElement), (0, _addFadeFunctions__WEBPACK_IMPORTED_MODULE_0__.j)(divElement), setTimeout(() => {
      (0, _addFadeFunctions__WEBPACK_IMPORTED_MODULE_0__.e)(divElement);
    }, messageDuration);
  }
}();
//# sourceMappingURL=createBlockedTabMessage.js.map