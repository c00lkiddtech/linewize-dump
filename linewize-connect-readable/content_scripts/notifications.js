(() => {
  "use strict";

  var NOTIFICATION_MESSAGE_TYPES;
  !function (NOTIFICATION_MESSAGE_TYPES) {
    NOTIFICATION_MESSAGE_TYPES.CREATE_NOTIFICATION_SCRIPT = "createNotificationScript";
  }(NOTIFICATION_MESSAGE_TYPES || (NOTIFICATION_MESSAGE_TYPES = {})), chrome.runtime.onMessage.addListener(msg => {
    if ((null == msg ? void 0 : msg.type) === NOTIFICATION_MESSAGE_TYPES.CREATE_NOTIFICATION_SCRIPT) {
      const {
        message: message,
        timestamp: timestamp
      } = msg.payload || {};
      "string" == typeof message && "number" == typeof timestamp && function (message, timestamp) {
        if (function () {
          if (!document.getElementById("linewize-message-container")) {
            const container = document.createElement("div");
            container.id = "linewize-message-container", document.body.appendChild(container);
          }
        }(), null != document.getElementById("linewize-message-container")) {
          const message_container = document.getElementById("linewize-message-container"),
            divElement = document.createElement("div"),
            messageElementId = "message-" + timestamp,
            messageDuration = 3e5;
          divElement.id = messageElementId, divElement.className = "message-element", divElement.className += " LinewizeMessageElement LinewizeMessageElement--new";
          const timeElement = document.createElement("div");
          timeElement.className = "LinewizeMessageElement_time";
          const messageDate = new Date(timestamp),
            messageAmPm = messageDate.getHours() >= 12 ? "pm" : "am";
          timeElement.innerHTML += (messageDate.getHours() % 12 == 0 ? 12 : messageDate.getHours() % 12) + ":" + (messageDate.getMinutes() < 10 ? "0" + messageDate.getMinutes() : messageDate.getMinutes()) + messageAmPm, divElement.appendChild(timeElement);
          const messageElement = document.createElement("span");
          messageElement.className = "LinewizeMessageElement_text", messageElement.innerHTML = message, divElement.appendChild(messageElement);
          const closeElement = document.createElement("img");
          closeElement.className = "LinewizeMessageElement_closeButton", closeElement.src = chrome.runtime.getURL("/background/assets/imgs/Close.svg"), closeElement.onclick = function () {
            divElement.remove();
          }, divElement.appendChild(closeElement), null == message_container || message_container.appendChild(divElement), function (divElement) {
            divElement && setTimeout(() => {
              divElement.style.marginLeft = "0", divElement.style.backgroundColor = "rgba(74,74,74,0.95)";
            }, 500);
          }(divElement), setTimeout(() => {
            !function (divElement) {
              divElement && (divElement.addEventListener("transitionend", () => {
                divElement.remove();
              }, !1), divElement.style.marginLeft = "100%", divElement.style.opacity = "0");
            }(divElement);
          }, messageDuration);
        }
      }(message, timestamp);
    }
  });
})();
//# sourceMappingURL=notifications.bundle.js.map