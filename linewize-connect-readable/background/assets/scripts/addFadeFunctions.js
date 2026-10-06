"use strict";

var __webpack_require__ = {
    d: (exports2, definition) => {
      for (var key in definition) __webpack_require__.o(definition, key) && !__webpack_require__.o(exports2, key) && Object.defineProperty(exports2, key, {
        enumerable: !0,
        get: definition[key]
      });
    },
    o: (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
  },
  __webpack_exports__ = {};
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
//# sourceMappingURL=addFadeFunctions.js.map