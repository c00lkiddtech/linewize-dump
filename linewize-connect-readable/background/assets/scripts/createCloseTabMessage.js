"use strict";

var __webpack_modules__ = {
    180: (e, n, t) => {
      t.d(n, {
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
    let closeTabMessageElement = null,
      closeTabContent = null,
      closeTabMessageFaviconContainer = null,
      closeTabMessageText = null,
      newMessage = !1;
    if (document.getElementById("linewize-close-tab-message")) closeTabMessageElement = document.getElementById("linewize-close-tab-message"), closeTabMessageFaviconContainer = document.getElementById("linewize-close-tab-message-favicon-container"), closeTabMessageText = document.getElementById("linewize-close-tab-message-text"), closeTabContent = document.getElementById("linewize-close-tab-content"), closeTabMessageText && (closeTabMessageText.innerHTML = "Some tabs were closed by your teacher");else {
      newMessage = !0, closeTabMessageElement = document.createElement("div"), closeTabMessageElement.id = "linewize-close-tab-message", closeTabMessageFaviconContainer = document.createElement("div"), closeTabMessageFaviconContainer.id = "linewize-close-tab-message-favicon-container", closeTabMessageFaviconContainer.className += "LinewizeCloseTabMessage_faviconContainer", closeTabContent = document.createElement("div"), closeTabContent.id = "linewize-close-tab-content", closeTabContent.className += "LinewizeCloseTabMessage_content", closeTabMessageText = document.createElement("div"), closeTabMessageText.id = "linewize-close-tab-message-text", closeTabMessageText.innerHTML = "A tab was closed by your teacher", closeTabMessageText.className += "LinewizeCloseTabMessage_text";
      const closeElement = document.createElement("img");
      closeElement.src = chrome.runtime.getURL("/background/assets/imgs/Close.svg"), closeElement.onclick = () => {
        closeTabMessageElement && closeTabMessageElement.remove();
      }, closeElement.className += "LinewizeCloseTabMessage_closeButton", closeTabContent.appendChild(closeTabMessageFaviconContainer), closeTabContent.appendChild(closeTabMessageText), closeTabContent.appendChild(closeElement), closeTabMessageElement.appendChild(closeTabContent);
    }
    const faviconElement = document.createElement("img");
    faviconElement.src = null !== (e = window.lwMsgingTabFavicon) && void 0 !== e ? e : "", faviconElement.className += "LinewizeCloseTabMessage_favicon", closeTabMessageFaviconContainer && closeTabMessageFaviconContainer.appendChild(faviconElement);
    const message_container = document.getElementById("linewize-message-container"),
      messageDuration = 3e5;
    closeTabMessageElement && (closeTabMessageElement.className = "message-element", closeTabMessageElement.className += " LinewizeMessageElement", newMessage && (closeTabMessageElement.className += " LinewizeMessageElement--new"), message_container && message_container.appendChild(closeTabMessageElement)), newMessage && (0, _addFadeFunctions__WEBPACK_IMPORTED_MODULE_0__.j)(closeTabMessageElement), setTimeout(() => {
      (0, _addFadeFunctions__WEBPACK_IMPORTED_MODULE_0__.e)(closeTabMessageElement);
    }, messageDuration);
  }
}();
//# sourceMappingURL=createCloseTabMessage.js.map