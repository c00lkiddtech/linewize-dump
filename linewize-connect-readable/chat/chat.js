(() => {
  "use strict";

  var __webpack_require__ = {
    d: (exports2, definition) => {
      for (var key in definition) __webpack_require__.o(definition, key) && !__webpack_require__.o(exports2, key) && Object.defineProperty(exports2, key, {
        enumerable: !0,
        get: definition[key]
      });
    },
    o: (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
  };
  __webpack_require__.d({}, {
    A: () => No
  });
  const t = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__,
    n = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__,
    SDK_VERSION = "8.40.0",
    i = globalThis;
  function getGlobalSingleton(name, creator, obj) {
    const gbl = obj || i,
      __SENTRY__ = gbl.__SENTRY__ = gbl.__SENTRY__ || {},
      versionedCarrier = __SENTRY__[SDK_VERSION] = __SENTRY__[SDK_VERSION] || {};
    return versionedCarrier[name] || (versionedCarrier[name] = creator());
  }
  const CONSOLE_LEVELS = ["debug", "info", "warn", "error", "log", "assert", "trace"],
    originalConsoleMethods = {};
  function consoleSandbox(callback) {
    if (!("console" in i)) return callback();
    const console2 = i.console,
      wrappedFuncs = {},
      wrappedLevels = Object.keys(originalConsoleMethods);
    wrappedLevels.forEach(level => {
      const originalConsoleMethod = originalConsoleMethods[level];
      wrappedFuncs[level] = console2[level], console2[level] = originalConsoleMethod;
    });
    try {
      return callback();
    } finally {
      wrappedLevels.forEach(level => {
        console2[level] = wrappedFuncs[level];
      });
    }
  }
  const c = getGlobalSingleton("logger", function () {
      let enabled = !1;
      const logger = {
        enable: () => {
          enabled = !0;
        },
        disable: () => {
          enabled = !1;
        },
        isEnabled: () => enabled
      };
      return n ? CONSOLE_LEVELS.forEach(name => {
        logger[name] = (...args) => {
          enabled && consoleSandbox(() => {
            i.console[name](`Sentry Logger [${name}]:`, ...args);
          });
        };
      }) : CONSOLE_LEVELS.forEach(name => {
        logger[name] = () => {};
      }), logger;
    }),
    installedIntegrations = [];
  function getIntegrationsToSetup(options) {
    const defaultIntegrations = options.defaultIntegrations || [],
      userIntegrations = options.integrations;
    let integrations;
    if (defaultIntegrations.forEach(integration => {
      integration.isDefaultInstance = !0;
    }), Array.isArray(userIntegrations)) integrations = [...defaultIntegrations, ...userIntegrations];else if ("function" == typeof userIntegrations) {
      const resolvedUserIntegrations = userIntegrations(defaultIntegrations);
      integrations = Array.isArray(resolvedUserIntegrations) ? resolvedUserIntegrations : [resolvedUserIntegrations];
    } else integrations = defaultIntegrations;
    const finalIntegrations = function (integrations) {
        const integrationsByName = {};
        return integrations.forEach(currentInstance => {
          const {
              name: name
            } = currentInstance,
            existingInstance = integrationsByName[name];
          existingInstance && !existingInstance.isDefaultInstance && currentInstance.isDefaultInstance || (integrationsByName[name] = currentInstance);
        }), Object.values(integrationsByName);
      }(integrations),
      debugIndex = finalIntegrations.findIndex(integration => "Debug" === integration.name);
    if (debugIndex > -1) {
      const [debugInstance] = finalIntegrations.splice(debugIndex, 1);
      finalIntegrations.push(debugInstance);
    }
    return finalIntegrations;
  }
  function afterSetupIntegrations(client, integrations) {
    for (const integration of integrations) integration && integration.afterAllSetup && integration.afterAllSetup(client);
  }
  function setupIntegration(client, integration, integrationIndex) {
    if (integrationIndex[integration.name]) t && c.log(`Integration skipped because it was already installed: ${integration.name}`);else {
      if (integrationIndex[integration.name] = integration, -1 === installedIntegrations.indexOf(integration.name) && "function" == typeof integration.setupOnce && (integration.setupOnce(), installedIntegrations.push(integration.name)), integration.setup && "function" == typeof integration.setup && integration.setup(client), "function" == typeof integration.preprocessEvent) {
        const callback = integration.preprocessEvent.bind(integration);
        client.on("preprocessEvent", (event, hint) => callback(event, hint, client));
      }
      if ("function" == typeof integration.processEvent) {
        const callback = integration.processEvent.bind(integration),
          processor = Object.assign((event, hint) => callback(event, hint, client), {
            id: integration.name
          });
        client.addEventProcessor(processor);
      }
      t && c.log(`Integration installed: ${integration.name}`);
    }
  }
  const objectToString = Object.prototype.toString;
  function isError(wat) {
    switch (objectToString.call(wat)) {
      case "[object Error]":
      case "[object Exception]":
      case "[object DOMException]":
      case "[object WebAssembly.Exception]":
        return !0;
      default:
        return isInstanceOf(wat, Error);
    }
  }
  function isBuiltin(wat, className) {
    return objectToString.call(wat) === `[object ${className}]`;
  }
  function isErrorEvent(wat) {
    return isBuiltin(wat, "ErrorEvent");
  }
  function isDOMError(wat) {
    return isBuiltin(wat, "DOMError");
  }
  function isString(wat) {
    return isBuiltin(wat, "String");
  }
  function isParameterizedString(wat) {
    return "object" == typeof wat && null !== wat && "__sentry_template_string__" in wat && "__sentry_template_values__" in wat;
  }
  function E(wat) {
    return null === wat || isParameterizedString(wat) || "object" != typeof wat && "function" != typeof wat;
  }
  function isPlainObject(wat) {
    return isBuiltin(wat, "Object");
  }
  function isEvent(wat) {
    return "undefined" != typeof Event && isInstanceOf(wat, Event);
  }
  function A(wat) {
    return Boolean(wat && wat.then && "function" == typeof wat.then);
  }
  function isInstanceOf(wat, base) {
    try {
      return wat instanceof base;
    } catch (_e) {
      return !1;
    }
  }
  function isVueViewModel(wat) {
    return !("object" != typeof wat || null === wat || !wat.__isVue && !wat._isVue);
  }
  const w = i;
  function htmlTreeAsString(elem, options = {}) {
    if (!elem) return "<unknown>";
    try {
      let currentElem = elem;
      const MAX_TRAVERSE_HEIGHT = 5,
        out = [];
      let height = 0,
        len = 0;
      const separator = " > ",
        sepLength = separator.length;
      let nextStr;
      const keyAttrs = Array.isArray(options) ? options : options.keyAttrs,
        maxStringLength = !Array.isArray(options) && options.maxStringLength || 80;
      for (; currentElem && height++ < MAX_TRAVERSE_HEIGHT && (nextStr = _htmlElementAsString(currentElem, keyAttrs), !("html" === nextStr || height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength));) out.push(nextStr), len += nextStr.length, currentElem = currentElem.parentNode;
      return out.reverse().join(separator);
    } catch (_oO) {
      return "<unknown>";
    }
  }
  function _htmlElementAsString(el, keyAttrs) {
    const elem = el,
      out = [];
    if (!elem || !elem.tagName) return "";
    if (w.HTMLElement && elem instanceof HTMLElement && elem.dataset) {
      if (elem.dataset.sentryComponent) return elem.dataset.sentryComponent;
      if (elem.dataset.sentryElement) return elem.dataset.sentryElement;
    }
    out.push(elem.tagName.toLowerCase());
    const keyAttrPairs = keyAttrs && keyAttrs.length ? keyAttrs.filter(keyAttr => elem.getAttribute(keyAttr)).map(keyAttr => [keyAttr, elem.getAttribute(keyAttr)]) : null;
    if (keyAttrPairs && keyAttrPairs.length) keyAttrPairs.forEach(keyAttrPair => {
      out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
    });else {
      elem.id && out.push(`#${elem.id}`);
      const className = elem.className;
      if (className && isString(className)) {
        const classes = className.split(/\s+/);
        for (const c of classes) out.push(`.${c}`);
      }
    }
    const allowedAttrs = ["aria-label", "type", "name", "title", "alt"];
    for (const k of allowedAttrs) {
      const attr = elem.getAttribute(k);
      attr && out.push(`[${k}="${attr}"]`);
    }
    return out.join("");
  }
  function truncate(str, max = 0) {
    return "string" != typeof str || 0 === max || str.length <= max ? str : `${str.slice(0, max)}...`;
  }
  function safeJoin(input, delimiter) {
    if (!Array.isArray(input)) return "";
    const output = [];
    for (let i = 0; i < input.length; i++) {
      const value = input[i];
      try {
        isVueViewModel(value) ? output.push("[VueViewModel]") : output.push(String(value));
      } catch (e) {
        output.push("[value cannot be serialized]");
      }
    }
    return output.join(delimiter);
  }
  function stringMatchesSomePattern(testString, patterns = [], requireExactStringMatch = !1) {
    return patterns.some(pattern => function (value, pattern, requireExactStringMatch = !1) {
      return !!isString(value) && (isBuiltin(pattern, "RegExp") ? pattern.test(value) : !!isString(pattern) && (requireExactStringMatch ? value === pattern : value.includes(pattern)));
    }(testString, pattern, requireExactStringMatch));
  }
  function fill(source, name, replacementFactory) {
    if (!(name in source)) return;
    const original = source[name],
      wrapped = replacementFactory(original);
    "function" == typeof wrapped && markFunctionWrapped(wrapped, original);
    try {
      source[name] = wrapped;
    } catch (e) {
      n && c.log(`Failed to replace method "${name}" in object`, source);
    }
  }
  function R(obj, name, value) {
    try {
      Object.defineProperty(obj, name, {
        value: value,
        writable: !0,
        configurable: !0
      });
    } catch (o_O) {
      n && c.log(`Failed to add non-enumerable property "${name}" to object`, obj);
    }
  }
  function markFunctionWrapped(wrapped, original) {
    try {
      const proto = original.prototype || {};
      wrapped.prototype = original.prototype = proto, R(wrapped, "__sentry_original__", original);
    } catch (o_O) {}
  }
  function getOriginalFunction(func) {
    return func.__sentry_original__;
  }
  function convertToPlainObject(value) {
    if (isError(value)) return {
      message: value.message,
      name: value.name,
      stack: value.stack,
      ...getOwnProperties(value)
    };
    if (isEvent(value)) {
      const newObj = {
        type: value.type,
        target: serializeEventTarget(value.target),
        currentTarget: serializeEventTarget(value.currentTarget),
        ...getOwnProperties(value)
      };
      return "undefined" != typeof CustomEvent && isInstanceOf(value, CustomEvent) && (newObj.detail = value.detail), newObj;
    }
    return value;
  }
  function serializeEventTarget(target) {
    try {
      return "undefined" != typeof Element && isInstanceOf(target, Element) ? htmlTreeAsString(target) : Object.prototype.toString.call(target);
    } catch (_oO) {
      return "<unknown>";
    }
  }
  function getOwnProperties(obj) {
    if ("object" == typeof obj && null !== obj) {
      const extractedProps = {};
      for (const property in obj) Object.prototype.hasOwnProperty.call(obj, property) && (extractedProps[property] = obj[property]);
      return extractedProps;
    }
    return {};
  }
  function j(inputValue) {
    return _dropUndefinedKeys(inputValue, new Map());
  }
  function _dropUndefinedKeys(inputValue, memoizationMap) {
    if (function (input) {
      if (!isPlainObject(input)) return !1;
      try {
        const name = Object.getPrototypeOf(input).constructor.name;
        return !name || "Object" === name;
      } catch (e2) {
        return !0;
      }
    }(inputValue)) {
      const memoVal = memoizationMap.get(inputValue);
      if (void 0 !== memoVal) return memoVal;
      const returnValue = {};
      memoizationMap.set(inputValue, returnValue);
      for (const key of Object.getOwnPropertyNames(inputValue)) void 0 !== inputValue[key] && (returnValue[key] = _dropUndefinedKeys(inputValue[key], memoizationMap));
      return returnValue;
    }
    if (Array.isArray(inputValue)) {
      const memoVal = memoizationMap.get(inputValue);
      if (void 0 !== memoVal) return memoVal;
      const returnValue = [];
      return memoizationMap.set(inputValue, returnValue), inputValue.forEach(item => {
        returnValue.push(_dropUndefinedKeys(item, memoizationMap));
      }), returnValue;
    }
    return inputValue;
  }
  function z() {
    const gbl = i,
      crypto2 = gbl.crypto || gbl.msCrypto;
    let getRandomByte = () => 16 * Math.random();
    try {
      if (crypto2 && crypto2.randomUUID) return crypto2.randomUUID().replace(/-/g, "");
      crypto2 && crypto2.getRandomValues && (getRandomByte = () => {
        const typedArray = new Uint8Array(1);
        return crypto2.getRandomValues(typedArray), typedArray[0];
      });
    } catch (_) {}
    return ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c => (c ^ (15 & getRandomByte()) >> c / 4).toString(16));
  }
  function getFirstException(event) {
    return event.exception && event.exception.values ? event.exception.values[0] : void 0;
  }
  function getEventDescription(event) {
    const {
      message: message,
      event_id: eventId
    } = event;
    if (message) return message;
    const firstException = getFirstException(event);
    return firstException ? firstException.type && firstException.value ? `${firstException.type}: ${firstException.value}` : firstException.type || firstException.value || eventId || "<unknown>" : eventId || "<unknown>";
  }
  function addExceptionTypeValue(event, value, type) {
    const exception = event.exception = event.exception || {},
      values = exception.values = exception.values || [],
      firstException = values[0] = values[0] || {};
    firstException.value || (firstException.value = value || ""), firstException.type || (firstException.type = type || "Error");
  }
  function addExceptionMechanism(event, newMechanism) {
    const firstException = getFirstException(event);
    if (!firstException) return;
    const currentMechanism = firstException.mechanism;
    if (firstException.mechanism = {
      type: "generic",
      handled: !0,
      ...currentMechanism,
      ...newMechanism
    }, newMechanism && "data" in newMechanism) {
      const mergedData = {
        ...(currentMechanism && currentMechanism.data),
        ...newMechanism.data
      };
      firstException.mechanism.data = mergedData;
    }
  }
  function checkOrSetAlreadyCaught(exception) {
    if (exception && exception.__sentry_captured__) return !0;
    try {
      R(exception, "__sentry_captured__", !0);
    } catch (err) {}
    return !1;
  }
  const DEFAULT_IGNORE_ERRORS = [/^Script error\.?$/, /^Javascript error: Script error\.? on line 0$/, /^ResizeObserver loop completed with undelivered notifications.$/, /^Cannot redefine property: googletag$/, "undefined is not an object (evaluating 'a.L')", 'can\'t redefine non-configurable property "solana"', "vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)", "Can't find variable: _AutofillCallbackHandler"],
    inboundFiltersIntegration = (options = {}) => ({
      name: "InboundFilters",
      processEvent(event, _hint, client) {
        const clientOptions = client.getOptions(),
          mergedOptions = function (internalOptions = {}, clientOptions = {}) {
            return {
              allowUrls: [...(internalOptions.allowUrls || []), ...(clientOptions.allowUrls || [])],
              denyUrls: [...(internalOptions.denyUrls || []), ...(clientOptions.denyUrls || [])],
              ignoreErrors: [...(internalOptions.ignoreErrors || []), ...(clientOptions.ignoreErrors || []), ...(internalOptions.disableErrorDefaults ? [] : DEFAULT_IGNORE_ERRORS)],
              ignoreTransactions: [...(internalOptions.ignoreTransactions || []), ...(clientOptions.ignoreTransactions || [])],
              ignoreInternal: void 0 === internalOptions.ignoreInternal || internalOptions.ignoreInternal
            };
          }(options, clientOptions);
        return function (event, options) {
          return options.ignoreInternal && function (event) {
            try {
              return "SentryError" === event.exception.values[0].type;
            } catch (e) {}
            return !1;
          }(event) ? (t && c.warn(`Event dropped due to being internal Sentry Error.\nEvent: ${getEventDescription(event)}`), !0) : function (event, ignoreErrors) {
            return !(event.type || !ignoreErrors || !ignoreErrors.length) && function (event) {
              const possibleMessages = [];
              let lastException;
              event.message && possibleMessages.push(event.message);
              try {
                lastException = event.exception.values[event.exception.values.length - 1];
              } catch (e) {}
              return lastException && lastException.value && (possibleMessages.push(lastException.value), lastException.type && possibleMessages.push(`${lastException.type}: ${lastException.value}`)), possibleMessages;
            }(event).some(message => stringMatchesSomePattern(message, ignoreErrors));
          }(event, options.ignoreErrors) ? (t && c.warn(`Event dropped due to being matched by \`ignoreErrors\` option.\nEvent: ${getEventDescription(event)}`), !0) : function (event) {
            return !event.type && !(!event.exception || !event.exception.values || 0 === event.exception.values.length) && !event.message && !event.exception.values.some(value => value.stacktrace || value.type && "Error" !== value.type || value.value);
          }(event) ? (t && c.warn(`Event dropped due to not having an error message, error type or stacktrace.\nEvent: ${getEventDescription(event)}`), !0) : function (event, ignoreTransactions) {
            if ("transaction" !== event.type || !ignoreTransactions || !ignoreTransactions.length) return !1;
            const name = event.transaction;
            return !!name && stringMatchesSomePattern(name, ignoreTransactions);
          }(event, options.ignoreTransactions) ? (t && c.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.\nEvent: ${getEventDescription(event)}`), !0) : function (event, denyUrls) {
            if (!denyUrls || !denyUrls.length) return !1;
            const url = _getEventFilterUrl(event);
            return !!url && stringMatchesSomePattern(url, denyUrls);
          }(event, options.denyUrls) ? (t && c.warn(`Event dropped due to being matched by \`denyUrls\` option.\nEvent: ${getEventDescription(event)}.\nUrl: ${_getEventFilterUrl(event)}`), !0) : !function (event, allowUrls) {
            if (!allowUrls || !allowUrls.length) return !0;
            const url = _getEventFilterUrl(event);
            return !url || stringMatchesSomePattern(url, allowUrls);
          }(event, options.allowUrls) && (t && c.warn(`Event dropped due to not being matched by \`allowUrls\` option.\nEvent: ${getEventDescription(event)}.\nUrl: ${_getEventFilterUrl(event)}`), !0);
        }(event, mergedOptions) ? null : event;
      }
    });
  function _getEventFilterUrl(event) {
    try {
      let frames;
      try {
        frames = event.exception.values[0].stacktrace.frames;
      } catch (e) {}
      return frames ? function (frames = []) {
        for (let i = frames.length - 1; i >= 0; i--) {
          const frame = frames[i];
          if (frame && "<anonymous>" !== frame.filename && "[native code]" !== frame.filename) return frame.filename || null;
        }
        return null;
      }(frames) : null;
    } catch (oO) {
      return t && c.error(`Cannot extract url for event ${getEventDescription(event)}`), null;
    }
  }
  function J() {
    return X(i), i;
  }
  function X(carrier) {
    const __SENTRY__ = carrier.__SENTRY__ = carrier.__SENTRY__ || {};
    return __SENTRY__.version = __SENTRY__.version || SDK_VERSION, __SENTRY__[SDK_VERSION] = __SENTRY__[SDK_VERSION] || {};
  }
  function dateTimestampInSeconds() {
    return Date.now() / 1e3;
  }
  const ee = function () {
    const {
      performance: performance
    } = i;
    if (!performance || !performance.now) return dateTimestampInSeconds;
    const approxStartingTimeOrigin = Date.now() - performance.now(),
      timeOrigin = null == performance.timeOrigin ? approxStartingTimeOrigin : performance.timeOrigin;
    return () => (timeOrigin + performance.now()) / 1e3;
  }();
  let _browserPerformanceTimeOriginMode;
  function updateSession(session, context = {}) {
    if (context.user && (!session.ipAddress && context.user.ip_address && (session.ipAddress = context.user.ip_address), session.did || context.did || (session.did = context.user.id || context.user.email || context.user.username)), session.timestamp = context.timestamp || ee(), context.abnormal_mechanism && (session.abnormal_mechanism = context.abnormal_mechanism), context.ignoreDuration && (session.ignoreDuration = context.ignoreDuration), context.sid && (session.sid = 32 === context.sid.length ? context.sid : z()), void 0 !== context.init && (session.init = context.init), !session.did && context.did && (session.did = `${context.did}`), "number" == typeof context.started && (session.started = context.started), session.ignoreDuration) session.duration = void 0;else if ("number" == typeof context.duration) session.duration = context.duration;else {
      const duration = session.timestamp - session.started;
      session.duration = duration >= 0 ? duration : 0;
    }
    context.release && (session.release = context.release), context.environment && (session.environment = context.environment), !session.ipAddress && context.ipAddress && (session.ipAddress = context.ipAddress), !session.userAgent && context.userAgent && (session.userAgent = context.userAgent), "number" == typeof context.errors && (session.errors = context.errors), context.status && (session.status = context.status);
  }
  function generatePropagationContext() {
    return {
      traceId: z(),
      spanId: z().substring(16)
    };
  }
  function merge(initialObj, mergeObj, levels = 2) {
    if (!mergeObj || "object" != typeof mergeObj || levels <= 0) return mergeObj;
    if (initialObj && mergeObj && 0 === Object.keys(mergeObj).length) return initialObj;
    const output = {
      ...initialObj
    };
    for (const key in mergeObj) Object.prototype.hasOwnProperty.call(mergeObj, key) && (output[key] = merge(output[key], mergeObj[key], levels - 1));
    return output;
  }
  (() => {
    const {
      performance: performance
    } = i;
    if (!performance || !performance.now) return void (_browserPerformanceTimeOriginMode = "none");
    const threshold = 36e5,
      performanceNow = performance.now(),
      dateNow = Date.now(),
      timeOriginDelta = performance.timeOrigin ? Math.abs(performance.timeOrigin + performanceNow - dateNow) : threshold,
      timeOriginIsReliable = timeOriginDelta < threshold,
      navigationStart = performance.timing && performance.timing.navigationStart,
      navigationStartDelta = "number" == typeof navigationStart ? Math.abs(navigationStart + performanceNow - dateNow) : threshold;
    timeOriginIsReliable || navigationStartDelta < threshold ? timeOriginDelta <= navigationStartDelta ? (_browserPerformanceTimeOriginMode = "timeOrigin", performance.timeOrigin) : _browserPerformanceTimeOriginMode = "navigationStart" : _browserPerformanceTimeOriginMode = "dateNow";
  })();
  const SCOPE_SPAN_FIELD = "_sentrySpan";
  function _setSpanForScope(scope, span) {
    span ? R(scope, SCOPE_SPAN_FIELD, span) : delete scope[SCOPE_SPAN_FIELD];
  }
  function ae(scope) {
    return scope[SCOPE_SPAN_FIELD];
  }
  class ScopeClass {
    constructor() {
      this._notifyingListeners = !1, this._scopeListeners = [], this._eventProcessors = [], this._breadcrumbs = [], this._attachments = [], this._user = {}, this._tags = {}, this._extra = {}, this._contexts = {}, this._sdkProcessingMetadata = {}, this._propagationContext = generatePropagationContext();
    }
    clone() {
      const newScope = new ScopeClass();
      return newScope._breadcrumbs = [...this._breadcrumbs], newScope._tags = {
        ...this._tags
      }, newScope._extra = {
        ...this._extra
      }, newScope._contexts = {
        ...this._contexts
      }, newScope._user = this._user, newScope._level = this._level, newScope._session = this._session, newScope._transactionName = this._transactionName, newScope._fingerprint = this._fingerprint, newScope._eventProcessors = [...this._eventProcessors], newScope._requestSession = this._requestSession, newScope._attachments = [...this._attachments], newScope._sdkProcessingMetadata = {
        ...this._sdkProcessingMetadata
      }, newScope._propagationContext = {
        ...this._propagationContext
      }, newScope._client = this._client, newScope._lastEventId = this._lastEventId, _setSpanForScope(newScope, ae(this)), newScope;
    }
    setClient(client) {
      this._client = client;
    }
    setLastEventId(lastEventId) {
      this._lastEventId = lastEventId;
    }
    getClient() {
      return this._client;
    }
    lastEventId() {
      return this._lastEventId;
    }
    addScopeListener(callback) {
      this._scopeListeners.push(callback);
    }
    addEventProcessor(callback) {
      return this._eventProcessors.push(callback), this;
    }
    setUser(user) {
      return this._user = user || {
        email: void 0,
        id: void 0,
        ip_address: void 0,
        username: void 0
      }, this._session && updateSession(this._session, {
        user: user
      }), this._notifyScopeListeners(), this;
    }
    getUser() {
      return this._user;
    }
    getRequestSession() {
      return this._requestSession;
    }
    setRequestSession(requestSession) {
      return this._requestSession = requestSession, this;
    }
    setTags(tags) {
      return this._tags = {
        ...this._tags,
        ...tags
      }, this._notifyScopeListeners(), this;
    }
    setTag(key, value) {
      return this._tags = {
        ...this._tags,
        [key]: value
      }, this._notifyScopeListeners(), this;
    }
    setExtras(extras) {
      return this._extra = {
        ...this._extra,
        ...extras
      }, this._notifyScopeListeners(), this;
    }
    setExtra(key, extra) {
      return this._extra = {
        ...this._extra,
        [key]: extra
      }, this._notifyScopeListeners(), this;
    }
    setFingerprint(fingerprint) {
      return this._fingerprint = fingerprint, this._notifyScopeListeners(), this;
    }
    setLevel(level) {
      return this._level = level, this._notifyScopeListeners(), this;
    }
    setTransactionName(name) {
      return this._transactionName = name, this._notifyScopeListeners(), this;
    }
    setContext(key, context) {
      return null === context ? delete this._contexts[key] : this._contexts[key] = context, this._notifyScopeListeners(), this;
    }
    setSession(session) {
      return session ? this._session = session : delete this._session, this._notifyScopeListeners(), this;
    }
    getSession() {
      return this._session;
    }
    update(captureContext) {
      if (!captureContext) return this;
      const scopeToMerge = "function" == typeof captureContext ? captureContext(this) : captureContext,
        [scopeInstance, requestSession] = scopeToMerge instanceof ce ? [scopeToMerge.getScopeData(), scopeToMerge.getRequestSession()] : isPlainObject(scopeToMerge) ? [captureContext, captureContext.requestSession] : [],
        {
          tags: tags,
          extra: extra,
          user: user,
          contexts: contexts,
          level: level,
          fingerprint = [],
          propagationContext: propagationContext
        } = scopeInstance || {};
      return this._tags = {
        ...this._tags,
        ...tags
      }, this._extra = {
        ...this._extra,
        ...extra
      }, this._contexts = {
        ...this._contexts,
        ...contexts
      }, user && Object.keys(user).length && (this._user = user), level && (this._level = level), fingerprint.length && (this._fingerprint = fingerprint), propagationContext && (this._propagationContext = propagationContext), requestSession && (this._requestSession = requestSession), this;
    }
    clear() {
      return this._breadcrumbs = [], this._tags = {}, this._extra = {}, this._user = {}, this._contexts = {}, this._level = void 0, this._transactionName = void 0, this._fingerprint = void 0, this._requestSession = void 0, this._session = void 0, _setSpanForScope(this, void 0), this._attachments = [], this._propagationContext = generatePropagationContext(), this._notifyScopeListeners(), this;
    }
    addBreadcrumb(breadcrumb, maxBreadcrumbs) {
      const maxCrumbs = "number" == typeof maxBreadcrumbs ? maxBreadcrumbs : 100;
      if (maxCrumbs <= 0) return this;
      const mergedBreadcrumb = {
          timestamp: dateTimestampInSeconds(),
          ...breadcrumb
        },
        breadcrumbs = this._breadcrumbs;
      return breadcrumbs.push(mergedBreadcrumb), this._breadcrumbs = breadcrumbs.length > maxCrumbs ? breadcrumbs.slice(-maxCrumbs) : breadcrumbs, this._notifyScopeListeners(), this;
    }
    getLastBreadcrumb() {
      return this._breadcrumbs[this._breadcrumbs.length - 1];
    }
    clearBreadcrumbs() {
      return this._breadcrumbs = [], this._notifyScopeListeners(), this;
    }
    addAttachment(attachment) {
      return this._attachments.push(attachment), this;
    }
    clearAttachments() {
      return this._attachments = [], this;
    }
    getScopeData() {
      return {
        breadcrumbs: this._breadcrumbs,
        attachments: this._attachments,
        contexts: this._contexts,
        tags: this._tags,
        extra: this._extra,
        user: this._user,
        level: this._level,
        fingerprint: this._fingerprint || [],
        eventProcessors: this._eventProcessors,
        propagationContext: this._propagationContext,
        sdkProcessingMetadata: this._sdkProcessingMetadata,
        transactionName: this._transactionName,
        span: ae(this)
      };
    }
    setSDKProcessingMetadata(newData) {
      return this._sdkProcessingMetadata = merge(this._sdkProcessingMetadata, newData, 2), this;
    }
    setPropagationContext(context) {
      return this._propagationContext = context, this;
    }
    getPropagationContext() {
      return this._propagationContext;
    }
    captureException(exception, hint) {
      const eventId = hint && hint.event_id ? hint.event_id : z();
      if (!this._client) return c.warn("No client configured on scope - will not capture exception!"), eventId;
      const syntheticException = new Error("Sentry syntheticException");
      return this._client.captureException(exception, {
        originalException: exception,
        syntheticException: syntheticException,
        ...hint,
        event_id: eventId
      }, this), eventId;
    }
    captureMessage(message, level, hint) {
      const eventId = hint && hint.event_id ? hint.event_id : z();
      if (!this._client) return c.warn("No client configured on scope - will not capture message!"), eventId;
      const syntheticException = new Error(message);
      return this._client.captureMessage(message, level, {
        originalException: message,
        syntheticException: syntheticException,
        ...hint,
        event_id: eventId
      }, this), eventId;
    }
    captureEvent(event, hint) {
      const eventId = hint && hint.event_id ? hint.event_id : z();
      return this._client ? (this._client.captureEvent(event, {
        ...hint,
        event_id: eventId
      }, this), eventId) : (c.warn("No client configured on scope - will not capture event!"), eventId);
    }
    _notifyScopeListeners() {
      this._notifyingListeners || (this._notifyingListeners = !0, this._scopeListeners.forEach(callback => {
        callback(this);
      }), this._notifyingListeners = !1);
    }
  }
  const ce = ScopeClass;
  class AsyncContextStack {
    constructor(scope, isolationScope) {
      let assignedScope, assignedIsolationScope;
      assignedScope = scope || new ce(), assignedIsolationScope = isolationScope || new ce(), this._stack = [{
        scope: assignedScope
      }], this._isolationScope = assignedIsolationScope;
    }
    withScope(callback) {
      const scope = this._pushScope();
      let maybePromiseResult;
      try {
        maybePromiseResult = callback(scope);
      } catch (e) {
        throw this._popScope(), e;
      }
      return A(maybePromiseResult) ? maybePromiseResult.then(res => (this._popScope(), res), e => {
        throw this._popScope(), e;
      }) : (this._popScope(), maybePromiseResult);
    }
    getClient() {
      return this.getStackTop().client;
    }
    getScope() {
      return this.getStackTop().scope;
    }
    getIsolationScope() {
      return this._isolationScope;
    }
    getStackTop() {
      return this._stack[this._stack.length - 1];
    }
    _pushScope() {
      const scope = this.getScope().clone();
      return this._stack.push({
        client: this.getClient(),
        scope: scope
      }), scope;
    }
    _popScope() {
      return !(this._stack.length <= 1 || !this._stack.pop());
    }
  }
  function getAsyncContextStack() {
    const sentry = X(J());
    return sentry.stack = sentry.stack || new AsyncContextStack(getGlobalSingleton("defaultCurrentScope", () => new ce()), getGlobalSingleton("defaultIsolationScope", () => new ce()));
  }
  function he(callback) {
    return getAsyncContextStack().withScope(callback);
  }
  function withSetScope(scope, callback) {
    const stack = getAsyncContextStack();
    return stack.withScope(() => (stack.getStackTop().scope = scope, callback(scope)));
  }
  function me(callback) {
    return getAsyncContextStack().withScope(() => callback(getAsyncContextStack().getIsolationScope()));
  }
  function fe(carrier) {
    const sentry = X(carrier);
    return sentry.acs ? sentry.acs : {
      withIsolationScope: me,
      withScope: he,
      withSetScope: withSetScope,
      withSetIsolationScope: (_isolationScope, callback) => me(callback),
      getCurrentScope: () => getAsyncContextStack().getScope(),
      getIsolationScope: () => getAsyncContextStack().getIsolationScope()
    };
  }
  function ge() {
    return fe(J()).getCurrentScope();
  }
  function De() {
    return fe(J()).getIsolationScope();
  }
  function ye() {
    return ge().getClient();
  }
  let originalFunctionToString;
  const SETUP_CLIENTS = new WeakMap(),
    functionToStringIntegration = () => ({
      name: "FunctionToString",
      setupOnce() {
        originalFunctionToString = Function.prototype.toString;
        try {
          Function.prototype.toString = function (...args) {
            const originalFunction = getOriginalFunction(this),
              context = SETUP_CLIENTS.has(ye()) && void 0 !== originalFunction ? originalFunction : this;
            return originalFunctionToString.apply(context, args);
          };
        } catch (e) {}
      },
      setup(client) {
        SETUP_CLIENTS.set(client, !0);
      }
    }),
    UNKNOWN_FUNCTION = "?",
    WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/,
    STRIP_FRAME_REGEXP = /captureMessage|captureException/;
  function createStackParser(...parsers) {
    const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map(p => p[1]);
    return (stack, skipFirstLines = 0, framesToPop = 0) => {
      const frames = [],
        lines = stack.split("\n");
      for (let i = skipFirstLines; i < lines.length; i++) {
        const line = lines[i];
        if (line.length > 1024) continue;
        const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, "$1") : line;
        if (!cleanedLine.match(/\S*Error: /)) {
          for (const parser of sortedParsers) {
            const frame = parser(cleanedLine);
            if (frame) {
              frames.push(frame);
              break;
            }
          }
          if (frames.length >= 50 + framesToPop) break;
        }
      }
      return function (stack) {
        if (!stack.length) return [];
        const localStack = Array.from(stack);
        return /sentryWrapped/.test(getLastStackFrame(localStack).function || "") && localStack.pop(), localStack.reverse(), STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || "") && (localStack.pop(), STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || "") && localStack.pop()), localStack.slice(0, 50).map(frame => ({
          ...frame,
          filename: frame.filename || getLastStackFrame(localStack).filename,
          function: frame.function || UNKNOWN_FUNCTION
        }));
      }(frames.slice(framesToPop));
    };
  }
  function getLastStackFrame(arr) {
    return arr[arr.length - 1] || {};
  }
  const defaultFunctionName = "<anonymous>";
  function getFunctionName(fn) {
    try {
      return fn && "function" == typeof fn && fn.name || defaultFunctionName;
    } catch (e) {
      return defaultFunctionName;
    }
  }
  function getFramesFromEvent(event) {
    const exception = event.exception;
    if (exception) {
      const frames = [];
      try {
        return exception.values.forEach(value => {
          value.stacktrace.frames && frames.push(...value.stacktrace.frames);
        }), frames;
      } catch (_oO) {
        return;
      }
    }
  }
  const dedupeIntegration = () => {
    let previousEvent;
    return {
      name: "Dedupe",
      processEvent(currentEvent) {
        if (currentEvent.type) return currentEvent;
        try {
          if (function (currentEvent, previousEvent) {
            return !!previousEvent && (!!function (currentEvent, previousEvent) {
              const currentMessage = currentEvent.message,
                previousMessage = previousEvent.message;
              return !(!currentMessage && !previousMessage) && !(currentMessage && !previousMessage || !currentMessage && previousMessage) && currentMessage === previousMessage && !!_isSameFingerprint(currentEvent, previousEvent) && !!_isSameStacktrace(currentEvent, previousEvent);
            }(currentEvent, previousEvent) || !!function (currentEvent, previousEvent) {
              const previousException = _getExceptionFromEvent(previousEvent),
                currentException = _getExceptionFromEvent(currentEvent);
              return !(!previousException || !currentException) && previousException.type === currentException.type && previousException.value === currentException.value && !!_isSameFingerprint(currentEvent, previousEvent) && !!_isSameStacktrace(currentEvent, previousEvent);
            }(currentEvent, previousEvent));
          }(currentEvent, previousEvent)) return t && c.warn("Event dropped due to being a duplicate of previously captured event."), null;
        } catch (_oO) {}
        return previousEvent = currentEvent;
      }
    };
  };
  function _isSameStacktrace(currentEvent, previousEvent) {
    let currentFrames = getFramesFromEvent(currentEvent),
      previousFrames = getFramesFromEvent(previousEvent);
    if (!currentFrames && !previousFrames) return !0;
    if (currentFrames && !previousFrames || !currentFrames && previousFrames) return !1;
    if (previousFrames.length !== currentFrames.length) return !1;
    for (let i2 = 0; i2 < previousFrames.length; i2++) {
      const frameA = previousFrames[i2],
        frameB = currentFrames[i2];
      if (frameA.filename !== frameB.filename || frameA.lineno !== frameB.lineno || frameA.colno !== frameB.colno || frameA.function !== frameB.function) return !1;
    }
    return !0;
  }
  function _isSameFingerprint(currentEvent, previousEvent) {
    let currentFingerprint = currentEvent.fingerprint,
      previousFingerprint = previousEvent.fingerprint;
    if (!currentFingerprint && !previousFingerprint) return !0;
    if (currentFingerprint && !previousFingerprint || !currentFingerprint && previousFingerprint) return !1;
    try {
      return !(currentFingerprint.join("") !== previousFingerprint.join(""));
    } catch (_oO) {
      return !1;
    }
  }
  function _getExceptionFromEvent(event) {
    return event.exception && event.exception.values && event.exception.values[0];
  }
  const Re = i;
  function supportsFetch() {
    if (!("fetch" in Re)) return !1;
    try {
      return new Headers(), new Request("http://www.example.com"), new Response(), !0;
    } catch (e) {
      return !1;
    }
  }
  function isNativeFunction(func) {
    return func && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(func.toString());
  }
  const DEFAULT_ENVIRONMENT = "production";
  var States;
  function resolvedSyncPromise(value) {
    return new SyncPromise(resolve => {
      resolve(value);
    });
  }
  function rejectedSyncPromise(reason) {
    return new SyncPromise((_, reject) => {
      reject(reason);
    });
  }
  !function (States) {
    States[States.PENDING = 0] = "PENDING", States[States.RESOLVED = 1] = "RESOLVED", States[States.REJECTED = 2] = "REJECTED";
  }(States || (States = {}));
  class SyncPromise {
    constructor(executor) {
      SyncPromise.prototype.__init.call(this), SyncPromise.prototype.__init2.call(this), SyncPromise.prototype.__init3.call(this), SyncPromise.prototype.__init4.call(this), this._state = States.PENDING, this._handlers = [];
      try {
        executor(this._resolve, this._reject);
      } catch (e) {
        this._reject(e);
      }
    }
    then(onfulfilled, onrejected) {
      return new SyncPromise((resolve, reject) => {
        this._handlers.push([!1, result => {
          if (onfulfilled) try {
            resolve(onfulfilled(result));
          } catch (e) {
            reject(e);
          } else resolve(result);
        }, reason => {
          if (onrejected) try {
            resolve(onrejected(reason));
          } catch (e) {
            reject(e);
          } else reject(reason);
        }]), this._executeHandlers();
      });
    }
    catch(onrejected) {
      return this.then(val => val, onrejected);
    }
    finally(onfinally) {
      return new SyncPromise((resolve, reject) => {
        let val, isRejected;
        return this.then(value => {
          isRejected = !1, val = value, onfinally && onfinally();
        }, reason => {
          isRejected = !0, val = reason, onfinally && onfinally();
        }).then(() => {
          isRejected ? reject(val) : resolve(val);
        });
      });
    }
    __init() {
      this._resolve = value => {
        this._setResult(States.RESOLVED, value);
      };
    }
    __init2() {
      this._reject = reason => {
        this._setResult(States.REJECTED, reason);
      };
    }
    __init3() {
      this._setResult = (state, value) => {
        this._state === States.PENDING && (A(value) ? value.then(this._resolve, this._reject) : (this._state = state, this._value = value, this._executeHandlers()));
      };
    }
    __init4() {
      this._executeHandlers = () => {
        if (this._state === States.PENDING) return;
        const cachedHandlers = this._handlers.slice();
        this._handlers = [], cachedHandlers.forEach(handler => {
          handler[0] || (this._state === States.RESOLVED && handler[1](this._value), this._state === States.REJECTED && handler[2](this._value), handler[0] = !0);
        });
      };
    }
  }
  function notifyEventProcessors(processors, event, hint, index = 0) {
    return new SyncPromise((resolve, reject) => {
      const processor = processors[index];
      if (null === event || "function" != typeof processor) resolve(event);else {
        const result = processor({
          ...event
        }, hint);
        t && processor.id && null === result && c.log(`Event processor "${processor.id}" dropped event`), A(result) ? result.then(final => notifyEventProcessors(processors, final, hint, index + 1).then(resolve)).then(null, reject) : notifyEventProcessors(processors, result, hint, index + 1).then(resolve).then(null, reject);
      }
    });
  }
  const debugIdStackParserCache = new WeakMap();
  function normalize(input, depth = 100, maxProperties = 1 / 0) {
    try {
      return visit("", input, depth, maxProperties);
    } catch (err) {
      return {
        ERROR: `**non-serializable** (${err})`
      };
    }
  }
  function normalizeToSize(object, depth = 3, maxSize = 102400) {
    const normalized = normalize(object, depth);
    return value = normalized, function (value) {
      return ~-encodeURI(value).split(/%..|./).length;
    }(JSON.stringify(value)) > maxSize ? normalizeToSize(object, depth - 1, maxSize) : normalized;
    var value;
  }
  function visit(key, value, depth = 1 / 0, maxProperties = 1 / 0, memo = function () {
    const hasWeakSet = "function" == typeof WeakSet,
      inner = hasWeakSet ? new WeakSet() : [];
    return [function (obj) {
      if (hasWeakSet) return !!inner.has(obj) || (inner.add(obj), !1);
      for (let i = 0; i < inner.length; i++) if (inner[i] === obj) return !0;
      return inner.push(obj), !1;
    }, function (obj) {
      if (hasWeakSet) inner.delete(obj);else for (let i = 0; i < inner.length; i++) if (inner[i] === obj) {
        inner.splice(i, 1);
        break;
      }
    }];
  }()) {
    const [memoize, unmemoize] = memo;
    if (null == value || ["boolean", "string"].includes(typeof value) || "number" == typeof value && Number.isFinite(value)) return value;
    const stringified = function (key, value) {
      try {
        if ("domain" === key && value && "object" == typeof value && value._events) return "[Domain]";
        if ("domainEmitter" === key) return "[DomainEmitter]";
        if ("undefined" != typeof global && value === global) return "[Global]";
        if ("undefined" != typeof window && value === window) return "[Window]";
        if ("undefined" != typeof document && value === document) return "[Document]";
        if (isVueViewModel(value)) return "[VueViewModel]";
        if (isPlainObject(wat = value) && "nativeEvent" in wat && "preventDefault" in wat && "stopPropagation" in wat) return "[SyntheticEvent]";
        if ("number" == typeof value && !Number.isFinite(value)) return `[${value}]`;
        if ("function" == typeof value) return `[Function: ${getFunctionName(value)}]`;
        if ("symbol" == typeof value) return `[${String(value)}]`;
        if ("bigint" == typeof value) return `[BigInt: ${String(value)}]`;
        const objName = function (value) {
          const prototype = Object.getPrototypeOf(value);
          return prototype ? prototype.constructor.name : "null prototype";
        }(value);
        return /^HTML(\w*)Element$/.test(objName) ? `[HTMLElement: ${objName}]` : `[object ${objName}]`;
      } catch (err) {
        return `**non-serializable** (${err})`;
      }
      var wat;
    }(key, value);
    if (!stringified.startsWith("[object ")) return stringified;
    if (value.__sentry_skip_normalization__) return value;
    const remainingDepth = "number" == typeof value.__sentry_override_normalization_depth__ ? value.__sentry_override_normalization_depth__ : depth;
    if (0 === remainingDepth) return stringified.replace("object ", "");
    if (memoize(value)) return "[Circular ~]";
    const valueWithToJSON = value;
    if (valueWithToJSON && "function" == typeof valueWithToJSON.toJSON) try {
      return visit("", valueWithToJSON.toJSON(), remainingDepth - 1, maxProperties, memo);
    } catch (err) {}
    const normalized = Array.isArray(value) ? [] : {};
    let numAdded = 0;
    const visitable = convertToPlainObject(value);
    for (const visitKey in visitable) {
      if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) continue;
      if (numAdded >= maxProperties) {
        normalized[visitKey] = "[MaxProperties ~]";
        break;
      }
      const visitValue = visitable[visitKey];
      normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo), numAdded++;
    }
    return unmemoize(value), normalized;
  }
  const SENTRY_BAGGAGE_KEY_PREFIX_REGEX = /^sentry-/;
  function baggageHeaderToObject(baggageHeader) {
    return baggageHeader.split(",").map(baggageEntry => baggageEntry.split("=").map(keyOrValue => decodeURIComponent(keyOrValue.trim()))).reduce((acc, [key, value]) => (key && value && (acc[key] = value), acc), {});
  }
  function getMetricSummaryJsonForSpan(span) {
    const storage = span._sentryMetrics;
    if (!storage) return;
    const output = {};
    for (const [, [exportKey, summary]] of storage) (output[exportKey] || (output[exportKey] = [])).push(j(summary));
    return output;
  }
  function spanToTraceContext(span) {
    const {
        spanId: span_id,
        traceId: trace_id
      } = span.spanContext(),
      {
        parent_span_id: parent_span_id
      } = Ze(span);
    return j({
      parent_span_id: parent_span_id,
      span_id: span_id,
      trace_id: trace_id
    });
  }
  function spanTimeInputToSeconds(input) {
    return "number" == typeof input ? ensureTimestampInSeconds(input) : Array.isArray(input) ? input[0] + input[1] / 1e9 : input instanceof Date ? ensureTimestampInSeconds(input.getTime()) : ee();
  }
  function ensureTimestampInSeconds(timestamp) {
    return timestamp > 9999999999 ? timestamp / 1e3 : timestamp;
  }
  function Ze(span) {
    if (function (span) {
      return "function" == typeof span.getSpanJSON;
    }(span)) return span.getSpanJSON();
    try {
      const {
        spanId: span_id,
        traceId: trace_id
      } = span.spanContext();
      if (function (span) {
        const castSpan = span;
        return !!(castSpan.attributes && castSpan.startTime && castSpan.name && castSpan.endTime && castSpan.status);
      }(span)) {
        const {
          attributes: attributes,
          startTime: startTime,
          name: name,
          endTime: endTime,
          parentSpanId: parentSpanId,
          status: status
        } = span;
        return j({
          span_id: span_id,
          trace_id: trace_id,
          data: attributes,
          description: name,
          parent_span_id: parentSpanId,
          start_timestamp: spanTimeInputToSeconds(startTime),
          timestamp: spanTimeInputToSeconds(endTime) || void 0,
          status: getStatusMessage(status),
          op: attributes["sentry.op"],
          origin: attributes["sentry.origin"],
          _metrics_summary: getMetricSummaryJsonForSpan(span)
        });
      }
      return {
        span_id: span_id,
        trace_id: trace_id
      };
    } catch (e) {
      return {};
    }
  }
  function getStatusMessage(status) {
    if (status && 0 !== status.code) return 1 === status.code ? "ok" : status.message || "unknown_error";
  }
  function getRootSpan(span) {
    return span._sentryRootSpan || span;
  }
  function getDynamicSamplingContextFromClient(trace_id, client) {
    const options = client.getOptions(),
      {
        publicKey: public_key
      } = client.getDsn() || {},
      dsc = j({
        environment: options.environment || DEFAULT_ENVIRONMENT,
        release: options.release,
        public_key: public_key,
        trace_id: trace_id
      });
    return client.emit("createDsc", dsc), dsc;
  }
  function st(span) {
    const client = ye();
    if (!client) return {};
    const dsc = getDynamicSamplingContextFromClient(Ze(span).trace_id || "", client),
      rootSpan = getRootSpan(span),
      frozenDsc = rootSpan._frozenDsc;
    if (frozenDsc) return frozenDsc;
    const traceState = rootSpan.spanContext().traceState,
      traceStateDsc = traceState && traceState.get("sentry.dsc"),
      dscOnTraceState = traceStateDsc && function (baggageHeader) {
        const baggageObject = function (baggageHeader) {
          if (baggageHeader && (isString(baggageHeader) || Array.isArray(baggageHeader))) return Array.isArray(baggageHeader) ? baggageHeader.reduce((acc, curr) => {
            const currBaggageObject = baggageHeaderToObject(curr);
            return Object.entries(currBaggageObject).forEach(([key, value]) => {
              acc[key] = value;
            }), acc;
          }, {}) : baggageHeaderToObject(baggageHeader);
        }(baggageHeader);
        if (!baggageObject) return;
        const dynamicSamplingContext = Object.entries(baggageObject).reduce((acc, [key, value]) => (key.match(SENTRY_BAGGAGE_KEY_PREFIX_REGEX) && (acc[key.slice(7)] = value), acc), {});
        return Object.keys(dynamicSamplingContext).length > 0 ? dynamicSamplingContext : void 0;
      }(traceStateDsc);
    if (dscOnTraceState) return dscOnTraceState;
    const jsonSpan = Ze(rootSpan),
      attributes = jsonSpan.data || {},
      maybeSampleRate = attributes["sentry.sample_rate"];
    null != maybeSampleRate && (dsc.sample_rate = `${maybeSampleRate}`);
    const source = attributes["sentry.source"],
      name = jsonSpan.description;
    return "url" !== source && name && (dsc.transaction = name), function () {
      if ("boolean" == typeof __SENTRY_TRACING__ && !__SENTRY_TRACING__) return !1;
      const client = ye(),
        options = client && client.getOptions();
      return !!options && (options.enableTracing || "tracesSampleRate" in options || "tracesSampler" in options);
    }() && (dsc.sampled = String(function (span) {
      const {
        traceFlags: traceFlags
      } = span.spanContext();
      return 1 === traceFlags;
    }(rootSpan))), client.emit("createDsc", dsc, rootSpan), dsc;
  }
  function mergeScopeData(data, mergeData) {
    const {
      extra: extra,
      tags: tags,
      user: user,
      contexts: contexts,
      level: level,
      sdkProcessingMetadata: sdkProcessingMetadata,
      breadcrumbs: breadcrumbs,
      fingerprint: fingerprint,
      eventProcessors: eventProcessors,
      attachments: attachments,
      propagationContext: propagationContext,
      transactionName: transactionName,
      span: span
    } = mergeData;
    mergeAndOverwriteScopeData(data, "extra", extra), mergeAndOverwriteScopeData(data, "tags", tags), mergeAndOverwriteScopeData(data, "user", user), mergeAndOverwriteScopeData(data, "contexts", contexts), data.sdkProcessingMetadata = merge(data.sdkProcessingMetadata, sdkProcessingMetadata, 2), level && (data.level = level), transactionName && (data.transactionName = transactionName), span && (data.span = span), breadcrumbs.length && (data.breadcrumbs = [...data.breadcrumbs, ...breadcrumbs]), fingerprint.length && (data.fingerprint = [...data.fingerprint, ...fingerprint]), eventProcessors.length && (data.eventProcessors = [...data.eventProcessors, ...eventProcessors]), attachments.length && (data.attachments = [...data.attachments, ...attachments]), data.propagationContext = {
      ...data.propagationContext,
      ...propagationContext
    };
  }
  function mergeAndOverwriteScopeData(data, prop, mergeVal) {
    data[prop] = merge(data[prop], mergeVal, 1);
  }
  function prepareEvent(options, event, hint, scope, client, isolationScope) {
    const {
        normalizeDepth = 3,
        normalizeMaxBreadth = 1e3
      } = options,
      prepared = {
        ...event,
        event_id: event.event_id || hint.event_id || z(),
        timestamp: event.timestamp || dateTimestampInSeconds()
      },
      integrations = hint.integrations || options.integrations.map(i => i.name);
    !function (event, options) {
      const {
        environment: environment,
        release: release,
        dist: dist,
        maxValueLength = 250
      } = options;
      "environment" in event || (event.environment = "environment" in options ? environment : DEFAULT_ENVIRONMENT), void 0 === event.release && void 0 !== release && (event.release = release), void 0 === event.dist && void 0 !== dist && (event.dist = dist), event.message && (event.message = truncate(event.message, maxValueLength));
      const exception = event.exception && event.exception.values && event.exception.values[0];
      exception && exception.value && (exception.value = truncate(exception.value, maxValueLength));
      const request = event.request;
      request && request.url && (request.url = truncate(request.url, maxValueLength));
    }(prepared, options), function (event, integrationNames) {
      integrationNames.length > 0 && (event.sdk = event.sdk || {}, event.sdk.integrations = [...(event.sdk.integrations || []), ...integrationNames]);
    }(prepared, integrations), client && client.emit("applyFrameMetadata", event), void 0 === event.type && function (event, stackParser) {
      const filenameDebugIdMap = function (stackParser) {
        const debugIdMap = i._sentryDebugIds;
        if (!debugIdMap) return {};
        let debugIdStackFramesCache;
        const cachedDebugIdStackFrameCache = debugIdStackParserCache.get(stackParser);
        return cachedDebugIdStackFrameCache ? debugIdStackFramesCache = cachedDebugIdStackFrameCache : (debugIdStackFramesCache = new Map(), debugIdStackParserCache.set(stackParser, debugIdStackFramesCache)), Object.keys(debugIdMap).reduce((acc, debugIdStackTrace) => {
          let parsedStack;
          const cachedParsedStack = debugIdStackFramesCache.get(debugIdStackTrace);
          cachedParsedStack ? parsedStack = cachedParsedStack : (parsedStack = stackParser(debugIdStackTrace), debugIdStackFramesCache.set(debugIdStackTrace, parsedStack));
          for (let i = parsedStack.length - 1; i >= 0; i--) {
            const stackFrame = parsedStack[i],
              file = stackFrame && stackFrame.filename;
            if (stackFrame && file) {
              acc[file] = debugIdMap[debugIdStackTrace];
              break;
            }
          }
          return acc;
        }, {});
      }(stackParser);
      try {
        event.exception.values.forEach(exception => {
          exception.stacktrace.frames.forEach(frame => {
            frame.filename && (frame.debug_id = filenameDebugIdMap[frame.filename]);
          });
        });
      } catch (e) {}
    }(prepared, options.stackParser);
    const finalScope = function (scope, captureContext) {
      if (!captureContext) return scope;
      const finalScope = scope ? scope.clone() : new ce();
      return finalScope.update(captureContext), finalScope;
    }(scope, hint.captureContext);
    hint.mechanism && addExceptionMechanism(prepared, hint.mechanism);
    const clientEventProcessors = client ? client.getEventProcessors() : [],
      data = getGlobalSingleton("globalScope", () => new ce()).getScopeData();
    isolationScope && mergeScopeData(data, isolationScope.getScopeData()), finalScope && mergeScopeData(data, finalScope.getScopeData());
    const attachments = [...(hint.attachments || []), ...data.attachments];
    return attachments.length && (hint.attachments = attachments), function (event, data) {
      const {
        fingerprint: fingerprint,
        span: span,
        breadcrumbs: breadcrumbs,
        sdkProcessingMetadata: sdkProcessingMetadata
      } = data;
      !function (event, data) {
        const {
            extra: extra,
            tags: tags,
            user: user,
            contexts: contexts,
            level: level,
            transactionName: transactionName
          } = data,
          cleanedExtra = j(extra);
        cleanedExtra && Object.keys(cleanedExtra).length && (event.extra = {
          ...cleanedExtra,
          ...event.extra
        });
        const cleanedTags = j(tags);
        cleanedTags && Object.keys(cleanedTags).length && (event.tags = {
          ...cleanedTags,
          ...event.tags
        });
        const cleanedUser = j(user);
        cleanedUser && Object.keys(cleanedUser).length && (event.user = {
          ...cleanedUser,
          ...event.user
        });
        const cleanedContexts = j(contexts);
        cleanedContexts && Object.keys(cleanedContexts).length && (event.contexts = {
          ...cleanedContexts,
          ...event.contexts
        }), level && (event.level = level), transactionName && "transaction" !== event.type && (event.transaction = transactionName);
      }(event, data), span && function (event, span) {
        event.contexts = {
          trace: spanToTraceContext(span),
          ...event.contexts
        }, event.sdkProcessingMetadata = {
          dynamicSamplingContext: st(span),
          ...event.sdkProcessingMetadata
        };
        const transactionName = Ze(getRootSpan(span)).description;
        transactionName && !event.transaction && "transaction" === event.type && (event.transaction = transactionName);
      }(event, span), function (event, fingerprint) {
        event.fingerprint = event.fingerprint ? Array.isArray(event.fingerprint) ? event.fingerprint : [event.fingerprint] : [], fingerprint && (event.fingerprint = event.fingerprint.concat(fingerprint)), event.fingerprint && !event.fingerprint.length && delete event.fingerprint;
      }(event, fingerprint), function (event, breadcrumbs) {
        const mergedBreadcrumbs = [...(event.breadcrumbs || []), ...breadcrumbs];
        event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : void 0;
      }(event, breadcrumbs), function (event, sdkProcessingMetadata) {
        event.sdkProcessingMetadata = {
          ...event.sdkProcessingMetadata,
          ...sdkProcessingMetadata
        };
      }(event, sdkProcessingMetadata);
    }(prepared, data), notifyEventProcessors([...clientEventProcessors, ...data.eventProcessors], prepared, hint).then(evt => (evt && function (event) {
      const filenameDebugIdMap = {};
      try {
        event.exception.values.forEach(exception => {
          exception.stacktrace.frames.forEach(frame => {
            frame.debug_id && (frame.abs_path ? filenameDebugIdMap[frame.abs_path] = frame.debug_id : frame.filename && (filenameDebugIdMap[frame.filename] = frame.debug_id), delete frame.debug_id);
          });
        });
      } catch (e) {}
      if (0 === Object.keys(filenameDebugIdMap).length) return;
      event.debug_meta = event.debug_meta || {}, event.debug_meta.images = event.debug_meta.images || [];
      const images = event.debug_meta.images;
      Object.entries(filenameDebugIdMap).forEach(([filename, debug_id]) => {
        images.push({
          type: "sourcemap",
          code_file: filename,
          debug_id: debug_id
        });
      });
    }(evt), "number" == typeof normalizeDepth && normalizeDepth > 0 ? function (event, depth, maxBreadth) {
      if (!event) return null;
      const normalized = {
        ...event,
        ...(event.breadcrumbs && {
          breadcrumbs: event.breadcrumbs.map(b => ({
            ...b,
            ...(b.data && {
              data: normalize(b.data, depth, maxBreadth)
            })
          }))
        }),
        ...(event.user && {
          user: normalize(event.user, depth, maxBreadth)
        }),
        ...(event.contexts && {
          contexts: normalize(event.contexts, depth, maxBreadth)
        }),
        ...(event.extra && {
          extra: normalize(event.extra, depth, maxBreadth)
        })
      };
      return event.contexts && event.contexts.trace && normalized.contexts && (normalized.contexts.trace = event.contexts.trace, event.contexts.trace.data && (normalized.contexts.trace.data = normalize(event.contexts.trace.data, depth, maxBreadth))), event.spans && (normalized.spans = event.spans.map(span => ({
        ...span,
        ...(span.data && {
          data: normalize(span.data, depth, maxBreadth)
        })
      }))), normalized;
    }(evt, normalizeDepth, normalizeMaxBreadth) : evt));
  }
  const captureContextKeys = ["user", "level", "extra", "contexts", "tags", "fingerprint", "requestSession", "propagationContext"];
  function captureEvent(event, hint) {
    return ge().captureEvent(event, hint);
  }
  function startSession(context) {
    const client = ye(),
      isolationScope = De(),
      currentScope = ge(),
      {
        release: release,
        environment = DEFAULT_ENVIRONMENT
      } = client && client.getOptions() || {},
      {
        userAgent: userAgent
      } = i.navigator || {},
      session = function (context) {
        const startingTime = ee(),
          session = {
            sid: z(),
            init: !0,
            timestamp: startingTime,
            started: startingTime,
            duration: 0,
            status: "ok",
            errors: 0,
            ignoreDuration: !1,
            toJSON: () => function (session) {
              return j({
                sid: `${session.sid}`,
                init: session.init,
                started: new Date(1e3 * session.started).toISOString(),
                timestamp: new Date(1e3 * session.timestamp).toISOString(),
                status: session.status,
                errors: session.errors,
                did: "number" == typeof session.did || "string" == typeof session.did ? `${session.did}` : void 0,
                duration: session.duration,
                abnormal_mechanism: session.abnormal_mechanism,
                attrs: {
                  release: session.release,
                  environment: session.environment,
                  ip_address: session.ipAddress,
                  user_agent: session.userAgent
                }
              });
            }(session)
          };
        return context && updateSession(session, context), session;
      }({
        release: release,
        environment: environment,
        user: currentScope.getUser() || isolationScope.getUser(),
        ...(userAgent && {
          userAgent: userAgent
        }),
        ...context
      }),
      currentSession = isolationScope.getSession();
    return currentSession && "ok" === currentSession.status && updateSession(currentSession, {
      status: "exited"
    }), endSession(), isolationScope.setSession(session), currentScope.setSession(session), session;
  }
  function endSession() {
    const isolationScope = De(),
      currentScope = ge(),
      session = currentScope.getSession() || isolationScope.getSession();
    session && function (session) {
      let context = {};
      "ok" === session.status && (context = {
        status: "exited"
      }), updateSession(session, context);
    }(session), _sendSessionUpdate(), isolationScope.setSession(), currentScope.setSession();
  }
  function _sendSessionUpdate() {
    const isolationScope = De(),
      currentScope = ge(),
      client = ye(),
      session = currentScope.getSession() || isolationScope.getSession();
    session && client && client.captureSession(session);
  }
  function captureSession(end = !1) {
    end ? endSession() : _sendSessionUpdate();
  }
  const handlers = {},
    instrumented = {};
  function ft(type, handler) {
    handlers[type] = handlers[type] || [], handlers[type].push(handler);
  }
  function gt(type, instrumentFn) {
    if (!instrumented[type]) {
      instrumented[type] = !0;
      try {
        instrumentFn();
      } catch (e) {
        n && c.error(`Error while instrumenting ${type}`, e);
      }
    }
  }
  function Dt(type, data) {
    const typeHandlers = type && handlers[type];
    if (typeHandlers) for (const handler of typeHandlers) try {
      handler(data);
    } catch (e) {
      n && c.error(`Error while triggering instrumentation handler.\nType: ${type}\nName: ${getFunctionName(handler)}\nError:`, e);
    }
  }
  const yt = i,
    _t = i;
  let lastHref;
  function addHistoryInstrumentationHandler(handler) {
    const type = "history";
    ft(type, handler), gt(type, instrumentHistory);
  }
  function instrumentHistory() {
    if (!function () {
      const chromeVar = yt.chrome,
        isChromePackagedApp = chromeVar && chromeVar.app && chromeVar.app.runtime,
        hasHistoryApi = "history" in yt && !!yt.history.pushState && !!yt.history.replaceState;
      return !isChromePackagedApp && hasHistoryApi;
    }()) return;
    const oldOnPopState = _t.onpopstate;
    function historyReplacementFunction(originalHistoryFunction) {
      return function (...args) {
        const url = args.length > 2 ? args[2] : void 0;
        if (url) {
          const from = lastHref,
            to = String(url);
          lastHref = to, Dt("history", {
            from: from,
            to: to
          });
        }
        return originalHistoryFunction.apply(this, args);
      };
    }
    _t.onpopstate = function (...args) {
      const to = _t.location.href,
        from = lastHref;
      if (lastHref = to, Dt("history", {
        from: from,
        to: to
      }), oldOnPopState) try {
        return oldOnPopState.apply(this, args);
      } catch (_oO) {}
    }, fill(_t.history, "pushState", historyReplacementFunction), fill(_t.history, "replaceState", historyReplacementFunction);
  }
  function getEnvelopeEndpointWithUrlEncodedAuth(dsn, tunnel, sdkInfo) {
    return tunnel || `${function (dsn) {
      return `${function (dsn) {
        const protocol = dsn.protocol ? `${dsn.protocol}:` : "",
          port = dsn.port ? `:${dsn.port}` : "";
        return `${protocol}//${dsn.host}${port}${dsn.path ? `/${dsn.path}` : ""}/api/`;
      }(dsn)}${dsn.projectId}/envelope/`;
    }(dsn)}?${function (dsn, sdkInfo) {
      return object = {
        sentry_key: dsn.publicKey,
        sentry_version: "7",
        ...(sdkInfo && {
          sentry_client: `${sdkInfo.name}/${sdkInfo.version}`
        })
      }, Object.keys(object).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`).join("&");
      var object;
    }(dsn, sdkInfo)}`;
  }
  const DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
  function Ft(dsn, withPassword = !1) {
    const {
      host: host,
      path: path,
      pass: pass,
      port: port,
      projectId: projectId,
      protocol: protocol,
      publicKey: publicKey
    } = dsn;
    return `${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ""}@${host}${port ? `:${port}` : ""}/${path ? `${path}/` : path}${projectId}`;
  }
  function dsnFromComponents(components) {
    return {
      protocol: components.protocol,
      publicKey: components.publicKey || "",
      pass: components.pass || "",
      host: components.host,
      port: components.port || "",
      path: components.path || "",
      projectId: components.projectId
    };
  }
  function wt(headers, items = []) {
    return [headers, items];
  }
  function addItemToEnvelope(envelope, newItem) {
    const [headers, items] = envelope;
    return [headers, [...items, newItem]];
  }
  function forEachEnvelopeItem(envelope, callback) {
    const envelopeItems = envelope[1];
    for (const envelopeItem of envelopeItems) if (callback(envelopeItem, envelopeItem[0].type)) return !0;
    return !1;
  }
  function encodeUTF8(input) {
    return i.__SENTRY__ && i.__SENTRY__.encodePolyfill ? i.__SENTRY__.encodePolyfill(input) : new TextEncoder().encode(input);
  }
  function serializeEnvelope(envelope) {
    const [envHeaders, items] = envelope;
    let parts = JSON.stringify(envHeaders);
    function append(next) {
      "string" == typeof parts ? parts = "string" == typeof next ? parts + next : [encodeUTF8(parts), next] : parts.push("string" == typeof next ? encodeUTF8(next) : next);
    }
    for (const item of items) {
      const [itemHeaders, payload] = item;
      if (append(`\n${JSON.stringify(itemHeaders)}\n`), "string" == typeof payload || payload instanceof Uint8Array) append(payload);else {
        let stringifiedPayload;
        try {
          stringifiedPayload = JSON.stringify(payload);
        } catch (e) {
          stringifiedPayload = JSON.stringify(normalize(payload));
        }
        append(stringifiedPayload);
      }
    }
    return "string" == typeof parts ? parts : function (buffers) {
      const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0),
        merged = new Uint8Array(totalLength);
      let offset = 0;
      for (const buffer of buffers) merged.set(buffer, offset), offset += buffer.length;
      return merged;
    }(parts);
  }
  function createAttachmentEnvelopeItem(attachment) {
    const buffer = "string" == typeof attachment.data ? encodeUTF8(attachment.data) : attachment.data;
    return [j({
      type: "attachment",
      length: buffer.length,
      filename: attachment.filename,
      content_type: attachment.contentType,
      attachment_type: attachment.attachmentType
    }), buffer];
  }
  const ITEM_TYPE_TO_DATA_CATEGORY_MAP = {
    session: "session",
    sessions: "session",
    attachment: "attachment",
    transaction: "transaction",
    event: "error",
    client_report: "internal",
    user_report: "default",
    profile: "profile",
    profile_chunk: "profile",
    replay_event: "replay",
    replay_recording: "replay",
    check_in: "monitor",
    feedback: "feedback",
    span: "span",
    statsd: "metric_bucket"
  };
  function envelopeItemTypeToDataCategory(type) {
    return ITEM_TYPE_TO_DATA_CATEGORY_MAP[type];
  }
  function getSdkMetadataForEnvelopeHeader(metadataOrEvent) {
    if (!metadataOrEvent || !metadataOrEvent.sdk) return;
    const {
      name: name,
      version: version
    } = metadataOrEvent.sdk;
    return {
      name: name,
      version: version
    };
  }
  class SentryError extends Error {
    constructor(message, logLevel = "warn") {
      super(message), this.message = message, this.name = new.target.prototype.constructor.name, Object.setPrototypeOf(this, new.target.prototype), this.logLevel = logLevel;
    }
  }
  const ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";
  class BaseClient {
    constructor(options) {
      if (this._options = options, this._integrations = {}, this._numProcessing = 0, this._outcomes = {}, this._hooks = {}, this._eventProcessors = [], options.dsn ? this._dsn = function (from) {
        const components = "string" == typeof from ? function (str) {
          const match = DSN_REGEX.exec(str);
          if (!match) return void consoleSandbox(() => {
            console.error(`Invalid Sentry Dsn: ${str}`);
          });
          const [protocol, publicKey, pass = "", host = "", port = "", lastPath = ""] = match.slice(1);
          let path = "",
            projectId = lastPath;
          const split = projectId.split("/");
          if (split.length > 1 && (path = split.slice(0, -1).join("/"), projectId = split.pop()), projectId) {
            const projectMatch = projectId.match(/^\d+/);
            projectMatch && (projectId = projectMatch[0]);
          }
          return dsnFromComponents({
            host: host,
            pass: pass,
            path: path,
            projectId: projectId,
            port: port,
            protocol: protocol,
            publicKey: publicKey
          });
        }(from) : dsnFromComponents(from);
        if (components && function (dsn) {
          if (!n) return !0;
          const {
            port: port,
            projectId: projectId,
            protocol: protocol
          } = dsn;
          return !(["protocol", "publicKey", "host", "projectId"].find(component => !dsn[component] && (c.error(`Invalid Sentry Dsn: ${component} missing`), !0)) || (projectId.match(/^\d+$/) ? function (protocol) {
            return "http" === protocol || "https" === protocol;
          }(protocol) ? port && isNaN(parseInt(port, 10)) && (c.error(`Invalid Sentry Dsn: Invalid port ${port}`), 1) : (c.error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`), 1) : (c.error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`), 1)));
        }(components)) return components;
      }(options.dsn) : t && c.warn("No DSN provided, client will not send events."), this._dsn) {
        const url = getEnvelopeEndpointWithUrlEncodedAuth(this._dsn, options.tunnel, options._metadata ? options._metadata.sdk : void 0);
        this._transport = options.transport({
          tunnel: this._options.tunnel,
          recordDroppedEvent: this.recordDroppedEvent.bind(this),
          ...options.transportOptions,
          url: url
        });
      }
    }
    captureException(exception, hint, scope) {
      const eventId = z();
      if (checkOrSetAlreadyCaught(exception)) return t && c.log(ALREADY_SEEN_ERROR), eventId;
      const hintWithEventId = {
        event_id: eventId,
        ...hint
      };
      return this._process(this.eventFromException(exception, hintWithEventId).then(event => this._captureEvent(event, hintWithEventId, scope))), hintWithEventId.event_id;
    }
    captureMessage(message, level, hint, currentScope) {
      const hintWithEventId = {
          event_id: z(),
          ...hint
        },
        eventMessage = isParameterizedString(message) ? message : String(message),
        promisedEvent = E(message) ? this.eventFromMessage(eventMessage, level, hintWithEventId) : this.eventFromException(message, hintWithEventId);
      return this._process(promisedEvent.then(event => this._captureEvent(event, hintWithEventId, currentScope))), hintWithEventId.event_id;
    }
    captureEvent(event, hint, currentScope) {
      const eventId = z();
      if (hint && hint.originalException && checkOrSetAlreadyCaught(hint.originalException)) return t && c.log(ALREADY_SEEN_ERROR), eventId;
      const hintWithEventId = {
          event_id: eventId,
          ...hint
        },
        capturedSpanScope = (event.sdkProcessingMetadata || {}).capturedSpanScope;
      return this._process(this._captureEvent(event, hintWithEventId, capturedSpanScope || currentScope)), hintWithEventId.event_id;
    }
    captureSession(session) {
      "string" != typeof session.release ? t && c.warn("Discarded session because of missing or non-string release") : (this.sendSession(session), updateSession(session, {
        init: !1
      }));
    }
    getDsn() {
      return this._dsn;
    }
    getOptions() {
      return this._options;
    }
    getSdkMetadata() {
      return this._options._metadata;
    }
    getTransport() {
      return this._transport;
    }
    flush(timeout) {
      const transport = this._transport;
      return transport ? (this.emit("flush"), this._isClientDoneProcessing(timeout).then(clientFinished => transport.flush(timeout).then(transportFlushed => clientFinished && transportFlushed))) : resolvedSyncPromise(!0);
    }
    close(timeout) {
      return this.flush(timeout).then(result => (this.getOptions().enabled = !1, this.emit("close"), result));
    }
    getEventProcessors() {
      return this._eventProcessors;
    }
    addEventProcessor(eventProcessor) {
      this._eventProcessors.push(eventProcessor);
    }
    init() {
      (this._isEnabled() || this._options.integrations.some(({
        name: name
      }) => name.startsWith("Spotlight"))) && this._setupIntegrations();
    }
    getIntegrationByName(integrationName) {
      return this._integrations[integrationName];
    }
    addIntegration(integration) {
      const isAlreadyInstalled = this._integrations[integration.name];
      setupIntegration(this, integration, this._integrations), isAlreadyInstalled || afterSetupIntegrations(this, [integration]);
    }
    sendEvent(event, hint = {}) {
      this.emit("beforeSendEvent", event, hint);
      let env = function (event, dsn, metadata, tunnel) {
        const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata),
          eventType = event.type && "replay_event" !== event.type ? event.type : "event";
        !function (event, sdkInfo) {
          sdkInfo && (event.sdk = event.sdk || {}, event.sdk.name = event.sdk.name || sdkInfo.name, event.sdk.version = event.sdk.version || sdkInfo.version, event.sdk.integrations = [...(event.sdk.integrations || []), ...(sdkInfo.integrations || [])], event.sdk.packages = [...(event.sdk.packages || []), ...(sdkInfo.packages || [])]);
        }(event, metadata && metadata.sdk);
        const envelopeHeaders = function (event, sdkInfo, tunnel, dsn) {
          const dynamicSamplingContext = event.sdkProcessingMetadata && event.sdkProcessingMetadata.dynamicSamplingContext;
          return {
            event_id: event.event_id,
            sent_at: new Date().toISOString(),
            ...(sdkInfo && {
              sdk: sdkInfo
            }),
            ...(!!tunnel && dsn && {
              dsn: Ft(dsn)
            }),
            ...(dynamicSamplingContext && {
              trace: j({
                ...dynamicSamplingContext
              })
            })
          };
        }(event, sdkInfo, tunnel, dsn);
        return delete event.sdkProcessingMetadata, wt(envelopeHeaders, [[{
          type: eventType
        }, event]]);
      }(event, this._dsn, this._options._metadata, this._options.tunnel);
      for (const attachment of hint.attachments || []) env = addItemToEnvelope(env, createAttachmentEnvelopeItem(attachment));
      const promise = this.sendEnvelope(env);
      promise && promise.then(sendResponse => this.emit("afterSendEvent", event, sendResponse), null);
    }
    sendSession(session) {
      const env = function (session, dsn, metadata, tunnel) {
        const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
        return wt({
          sent_at: new Date().toISOString(),
          ...(sdkInfo && {
            sdk: sdkInfo
          }),
          ...(!!tunnel && dsn && {
            dsn: Ft(dsn)
          })
        }, ["aggregates" in session ? [{
          type: "sessions"
        }, session] : [{
          type: "session"
        }, session.toJSON()]]);
      }(session, this._dsn, this._options._metadata, this._options.tunnel);
      this.sendEnvelope(env);
    }
    recordDroppedEvent(reason, category, eventOrCount) {
      if (this._options.sendClientReports) {
        const count = "number" == typeof eventOrCount ? eventOrCount : 1,
          key = `${reason}:${category}`;
        t && c.log(`Recording outcome: "${key}"${count > 1 ? ` (${count} times)` : ""}`), this._outcomes[key] = (this._outcomes[key] || 0) + count;
      }
    }
    on(hook, callback) {
      const hooks = this._hooks[hook] = this._hooks[hook] || [];
      return hooks.push(callback), () => {
        const cbIndex = hooks.indexOf(callback);
        cbIndex > -1 && hooks.splice(cbIndex, 1);
      };
    }
    emit(hook, ...rest) {
      const callbacks = this._hooks[hook];
      callbacks && callbacks.forEach(callback => callback(...rest));
    }
    sendEnvelope(envelope) {
      return this.emit("beforeEnvelope", envelope), this._isEnabled() && this._transport ? this._transport.send(envelope).then(null, reason => (t && c.error("Error while sending envelope:", reason), reason)) : (t && c.error("Transport disabled"), resolvedSyncPromise({}));
    }
    _setupIntegrations() {
      const {
        integrations: integrations
      } = this._options;
      this._integrations = function (client, integrations) {
        const integrationIndex = {};
        return integrations.forEach(integration => {
          integration && setupIntegration(client, integration, integrationIndex);
        }), integrationIndex;
      }(this, integrations), afterSetupIntegrations(this, integrations);
    }
    _updateSessionFromEvent(session, event) {
      let crashed = !1,
        errored = !1;
      const exceptions = event.exception && event.exception.values;
      if (exceptions) {
        errored = !0;
        for (const ex of exceptions) {
          const mechanism = ex.mechanism;
          if (mechanism && !1 === mechanism.handled) {
            crashed = !0;
            break;
          }
        }
      }
      const sessionNonTerminal = "ok" === session.status;
      (sessionNonTerminal && 0 === session.errors || sessionNonTerminal && crashed) && (updateSession(session, {
        ...(crashed && {
          status: "crashed"
        }),
        errors: session.errors || Number(errored || crashed)
      }), this.captureSession(session));
    }
    _isClientDoneProcessing(timeout) {
      return new SyncPromise(resolve => {
        let ticked = 0;
        const interval = setInterval(() => {
          0 == this._numProcessing ? (clearInterval(interval), resolve(!0)) : (ticked += 1, timeout && ticked >= timeout && (clearInterval(interval), resolve(!1)));
        }, 1);
      });
    }
    _isEnabled() {
      return !1 !== this.getOptions().enabled && void 0 !== this._transport;
    }
    _prepareEvent(event, hint, currentScope, isolationScope = De()) {
      const options = this.getOptions(),
        integrations = Object.keys(this._integrations);
      return !hint.integrations && integrations.length > 0 && (hint.integrations = integrations), this.emit("preprocessEvent", event, hint), event.type || isolationScope.setLastEventId(event.event_id || hint.event_id), prepareEvent(options, event, hint, currentScope, this, isolationScope).then(evt => {
        if (null === evt) return evt;
        const propagationContext = {
          ...isolationScope.getPropagationContext(),
          ...(currentScope ? currentScope.getPropagationContext() : void 0)
        };
        if ((!evt.contexts || !evt.contexts.trace) && propagationContext) {
          const {
            traceId: trace_id,
            spanId: spanId,
            parentSpanId: parentSpanId,
            dsc: dsc
          } = propagationContext;
          evt.contexts = {
            trace: j({
              trace_id: trace_id,
              span_id: spanId,
              parent_span_id: parentSpanId
            }),
            ...evt.contexts
          };
          const dynamicSamplingContext = dsc || getDynamicSamplingContextFromClient(trace_id, this);
          evt.sdkProcessingMetadata = {
            dynamicSamplingContext: dynamicSamplingContext,
            ...evt.sdkProcessingMetadata
          };
        }
        return evt;
      });
    }
    _captureEvent(event, hint = {}, scope) {
      return this._processEvent(event, hint, scope).then(finalEvent => finalEvent.event_id, reason => {
        if (t) {
          const sentryError = reason;
          "log" === sentryError.logLevel ? c.log(sentryError.message) : c.warn(sentryError);
        }
      });
    }
    _processEvent(event, hint, currentScope) {
      const options = this.getOptions(),
        {
          sampleRate: sampleRate
        } = options,
        isTransaction = isTransactionEvent(event),
        isError = Ut(event),
        eventType = event.type || "error",
        beforeSendLabel = `before send for type \`${eventType}\``,
        parsedSampleRate = void 0 === sampleRate ? void 0 : function (sampleRate) {
          if ("boolean" == typeof sampleRate) return Number(sampleRate);
          const rate = "string" == typeof sampleRate ? parseFloat(sampleRate) : sampleRate;
          if (!("number" != typeof rate || isNaN(rate) || rate < 0 || rate > 1)) return rate;
          t && c.warn(`[Tracing] Given sample rate is invalid. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(sampleRate)} of type ${JSON.stringify(typeof sampleRate)}.`);
        }(sampleRate);
      if (isError && "number" == typeof parsedSampleRate && Math.random() > parsedSampleRate) return this.recordDroppedEvent("sample_rate", "error", event), rejectedSyncPromise(new SentryError(`Discarding event because it's not included in the random sample (sampling rate = ${sampleRate})`, "log"));
      const dataCategory = "replay_event" === eventType ? "replay" : eventType,
        capturedSpanIsolationScope = (event.sdkProcessingMetadata || {}).capturedSpanIsolationScope;
      return this._prepareEvent(event, hint, currentScope, capturedSpanIsolationScope).then(prepared => {
        if (null === prepared) throw this.recordDroppedEvent("event_processor", dataCategory, event), new SentryError("An event processor returned `null`, will not send event.", "log");
        if (hint.data && !0 === hint.data.__sentry__) return prepared;
        const result = function (client, options, event, hint) {
          const {
            beforeSend: beforeSend,
            beforeSendTransaction: beforeSendTransaction,
            beforeSendSpan: beforeSendSpan
          } = options;
          if (Ut(event) && beforeSend) return beforeSend(event, hint);
          if (isTransactionEvent(event)) {
            if (event.spans && beforeSendSpan) {
              const processedSpans = [];
              for (const span of event.spans) {
                const processedSpan = beforeSendSpan(span);
                processedSpan ? processedSpans.push(processedSpan) : client.recordDroppedEvent("before_send", "span");
              }
              event.spans = processedSpans;
            }
            if (beforeSendTransaction) {
              if (event.spans) {
                const spanCountBefore = event.spans.length;
                event.sdkProcessingMetadata = {
                  ...event.sdkProcessingMetadata,
                  spanCountBeforeProcessing: spanCountBefore
                };
              }
              return beforeSendTransaction(event, hint);
            }
          }
          return event;
        }(this, options, prepared, hint);
        return function (beforeSendResult, beforeSendLabel) {
          const invalidValueError = `${beforeSendLabel} must return \`null\` or a valid event.`;
          if (A(beforeSendResult)) return beforeSendResult.then(event => {
            if (!isPlainObject(event) && null !== event) throw new SentryError(invalidValueError);
            return event;
          }, e => {
            throw new SentryError(`${beforeSendLabel} rejected with ${e}`);
          });
          if (!isPlainObject(beforeSendResult) && null !== beforeSendResult) throw new SentryError(invalidValueError);
          return beforeSendResult;
        }(result, beforeSendLabel);
      }).then(processedEvent => {
        if (null === processedEvent) {
          if (this.recordDroppedEvent("before_send", dataCategory, event), isTransaction) {
            const spanCount = 1 + (event.spans || []).length;
            this.recordDroppedEvent("before_send", "span", spanCount);
          }
          throw new SentryError(`${beforeSendLabel} returned \`null\`, will not send event.`, "log");
        }
        const session = currentScope && currentScope.getSession();
        if (!isTransaction && session && this._updateSessionFromEvent(session, processedEvent), isTransaction) {
          const droppedSpanCount = (processedEvent.sdkProcessingMetadata && processedEvent.sdkProcessingMetadata.spanCountBeforeProcessing || 0) - (processedEvent.spans ? processedEvent.spans.length : 0);
          droppedSpanCount > 0 && this.recordDroppedEvent("before_send", "span", droppedSpanCount);
        }
        const transactionInfo = processedEvent.transaction_info;
        if (isTransaction && transactionInfo && processedEvent.transaction !== event.transaction) {
          const source = "custom";
          processedEvent.transaction_info = {
            ...transactionInfo,
            source: source
          };
        }
        return this.sendEvent(processedEvent, hint), processedEvent;
      }).then(null, reason => {
        if (reason instanceof SentryError) throw reason;
        throw this.captureException(reason, {
          data: {
            __sentry__: !0
          },
          originalException: reason
        }), new SentryError(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: ${reason}`);
      });
    }
    _process(promise) {
      this._numProcessing++, promise.then(value => (this._numProcessing--, value), reason => (this._numProcessing--, reason));
    }
    _clearOutcomes() {
      const outcomes = this._outcomes;
      return this._outcomes = {}, Object.entries(outcomes).map(([key, quantity]) => {
        const [reason, category] = key.split(":");
        return {
          reason: reason,
          category: category,
          quantity: quantity
        };
      });
    }
    _flushOutcomes() {
      t && c.log("Flushing outcomes...");
      const outcomes = this._clearOutcomes();
      if (0 === outcomes.length) return void (t && c.log("No outcomes to send"));
      if (!this._dsn) return void (t && c.log("No dsn provided, will not send outcomes"));
      t && c.log("Sending outcomes:", outcomes);
      const envelope = (discarded_events = outcomes, wt((dsn = this._options.tunnel && Ft(this._dsn)) ? {
        dsn: dsn
      } : {}, [[{
        type: "client_report"
      }, {
        timestamp: dateTimestampInSeconds(),
        discarded_events: discarded_events
      }]]));
      var discarded_events, dsn;
      this.sendEnvelope(envelope);
    }
  }
  function Ut(event) {
    return void 0 === event.type;
  }
  function isTransactionEvent(event) {
    return "transaction" === event.type;
  }
  const $t = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__;
  function exceptionFromError(stackParser, ex) {
    const frames = parseStackFrames(stackParser, ex),
      exception = {
        type: extractType(ex),
        value: extractMessage(ex)
      };
    return frames.length && (exception.stacktrace = {
      frames: frames
    }), void 0 === exception.type && "" === exception.value && (exception.value = "Unrecoverable error caught"), exception;
  }
  function eventFromError(stackParser, ex) {
    return {
      exception: {
        values: [exceptionFromError(stackParser, ex)]
      }
    };
  }
  function parseStackFrames(stackParser, ex) {
    const stacktrace = ex.stacktrace || ex.stack || "",
      skipLines = function (ex) {
        return ex && reactMinifiedRegexp.test(ex.message) ? 1 : 0;
      }(ex),
      framesToPop = function (ex) {
        return "number" == typeof ex.framesToPop ? ex.framesToPop : 0;
      }(ex);
    try {
      return stackParser(stacktrace, skipLines, framesToPop);
    } catch (e) {}
    return [];
  }
  const reactMinifiedRegexp = /Minified React error #\d+;/i;
  function isWebAssemblyException(exception) {
    return "undefined" != typeof WebAssembly && void 0 !== WebAssembly.Exception && exception instanceof WebAssembly.Exception;
  }
  function extractType(ex) {
    const name = ex && ex.name;
    return !name && isWebAssemblyException(ex) ? ex.message && Array.isArray(ex.message) && 2 == ex.message.length ? ex.message[0] : "WebAssembly.Exception" : name;
  }
  function extractMessage(ex) {
    const message = ex && ex.message;
    return message ? message.error && "string" == typeof message.error.message ? message.error.message : isWebAssemblyException(ex) && Array.isArray(ex.message) && 2 == ex.message.length ? ex.message[1] : message : "No error message";
  }
  function eventFromUnknownInput(stackParser, exception, syntheticException, attachStacktrace, isUnhandledRejection) {
    let event;
    if (isErrorEvent(exception) && exception.error) return eventFromError(stackParser, exception.error);
    if (isDOMError(exception) || isBuiltin(exception, "DOMException")) {
      const domException = exception;
      if ("stack" in exception) event = eventFromError(stackParser, exception);else {
        const name = domException.name || (isDOMError(domException) ? "DOMError" : "DOMException"),
          message = domException.message ? `${name}: ${domException.message}` : name;
        event = eventFromString(stackParser, message, syntheticException, attachStacktrace), addExceptionTypeValue(event, message);
      }
      return "code" in domException && (event.tags = {
        ...event.tags,
        "DOMException.code": `${domException.code}`
      }), event;
    }
    return isError(exception) ? eventFromError(stackParser, exception) : isPlainObject(exception) || isEvent(exception) ? (event = function (stackParser, exception, syntheticException, isUnhandledRejection) {
      const client = ye(),
        normalizeDepth = client && client.getOptions().normalizeDepth,
        errorFromProp = function (obj) {
          for (const prop in obj) if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            const value = obj[prop];
            if (value instanceof Error) return value;
          }
        }(exception),
        extra = {
          __serialized__: normalizeToSize(exception, normalizeDepth)
        };
      if (errorFromProp) return {
        exception: {
          values: [exceptionFromError(stackParser, errorFromProp)]
        },
        extra: extra
      };
      const event = {
        exception: {
          values: [{
            type: isEvent(exception) ? exception.constructor.name : isUnhandledRejection ? "UnhandledRejection" : "Error",
            value: getNonErrorObjectExceptionValue(exception, {
              isUnhandledRejection: isUnhandledRejection
            })
          }]
        },
        extra: extra
      };
      if (syntheticException) {
        const frames = parseStackFrames(stackParser, syntheticException);
        frames.length && (event.exception.values[0].stacktrace = {
          frames: frames
        });
      }
      return event;
    }(stackParser, exception, syntheticException, isUnhandledRejection), addExceptionMechanism(event, {
      synthetic: !0
    }), event) : (event = eventFromString(stackParser, exception, syntheticException, attachStacktrace), addExceptionTypeValue(event, `${exception}`, void 0), addExceptionMechanism(event, {
      synthetic: !0
    }), event);
  }
  function eventFromString(stackParser, message, syntheticException, attachStacktrace) {
    const event = {};
    if (attachStacktrace && syntheticException) {
      const frames = parseStackFrames(stackParser, syntheticException);
      frames.length && (event.exception = {
        values: [{
          value: message,
          stacktrace: {
            frames: frames
          }
        }]
      });
    }
    if (isParameterizedString(message)) {
      const {
        __sentry_template_string__: __sentry_template_string__,
        __sentry_template_values__: __sentry_template_values__
      } = message;
      return event.logentry = {
        message: __sentry_template_string__,
        params: __sentry_template_values__
      }, event;
    }
    return event.message = message, event;
  }
  function getNonErrorObjectExceptionValue(exception, {
    isUnhandledRejection: isUnhandledRejection
  }) {
    const keys = function (exception, maxLength = 40) {
        const keys = Object.keys(convertToPlainObject(exception));
        keys.sort();
        const firstKey = keys[0];
        if (!firstKey) return "[object has no keys]";
        if (firstKey.length >= maxLength) return truncate(firstKey, maxLength);
        for (let includedKeys = keys.length; includedKeys > 0; includedKeys--) {
          const serialized = keys.slice(0, includedKeys).join(", ");
          if (!(serialized.length > maxLength)) return includedKeys === keys.length ? serialized : truncate(serialized, maxLength);
        }
        return "";
      }(exception),
      captureType = isUnhandledRejection ? "promise rejection" : "exception";
    return isErrorEvent(exception) ? `Event \`ErrorEvent\` captured as ${captureType} with message \`${exception.message}\`` : isEvent(exception) ? `Event \`${function (obj) {
      try {
        const prototype = Object.getPrototypeOf(obj);
        return prototype ? prototype.constructor.name : void 0;
      } catch (e) {}
    }(exception)}\` (type=${exception.type}) captured as ${captureType}` : `Object captured as ${captureType} with keys: ${keys}`;
  }
  const Xt = i;
  let debounceTimerID,
    lastCapturedEventType,
    lastCapturedEventTargetId,
    ignoreOnError = 0;
  function shouldIgnoreOnError() {
    return ignoreOnError > 0;
  }
  function wrap(fn, options = {}, before) {
    if ("function" != typeof fn) return fn;
    try {
      const wrapper = fn.__sentry_wrapped__;
      if (wrapper) return "function" == typeof wrapper ? wrapper : fn;
      if (getOriginalFunction(fn)) return fn;
    } catch (e) {
      return fn;
    }
    const sentryWrapped = function () {
      const args = Array.prototype.slice.call(arguments);
      try {
        const wrappedArguments = args.map(arg => wrap(arg, options));
        return fn.apply(this, wrappedArguments);
      } catch (ex) {
        throw ignoreOnError++, setTimeout(() => {
          ignoreOnError--;
        }), function (...rest) {
          const acs = fe(J());
          if (2 === rest.length) {
            const [scope, callback] = rest;
            return scope ? acs.withSetScope(scope, callback) : acs.withScope(callback);
          }
          acs.withScope(rest[0]);
        }(scope => {
          var exception;
          scope.addEventProcessor(event => (options.mechanism && (addExceptionTypeValue(event, void 0, void 0), addExceptionMechanism(event, options.mechanism)), event.extra = {
            ...event.extra,
            arguments: args
          }, event)), exception = ex, ge().captureException(exception, function (hint) {
            if (hint) return function (hint) {
              return hint instanceof ce || "function" == typeof hint;
            }(hint) || function (hint) {
              return Object.keys(hint).some(key => captureContextKeys.includes(key));
            }(hint) ? {
              captureContext: hint
            } : hint;
          }(undefined));
        }), ex;
      }
    };
    try {
      for (const property in fn) Object.prototype.hasOwnProperty.call(fn, property) && (sentryWrapped[property] = fn[property]);
    } catch (_oO) {}
    markFunctionWrapped(sentryWrapped, fn), R(fn, "__sentry_wrapped__", sentryWrapped);
    try {
      Object.getOwnPropertyDescriptor(sentryWrapped, "name").configurable && Object.defineProperty(sentryWrapped, "name", {
        get: () => fn.name
      });
    } catch (_oO) {}
    return sentryWrapped;
  }
  class rn extends BaseClient {
    constructor(options) {
      const opts = {
        parentSpanIsAlwaysRootSpan: !0,
        ...options
      };
      !function (options, name, names = [name], source = "npm") {
        const metadata = options._metadata || {};
        metadata.sdk || (metadata.sdk = {
          name: `sentry.javascript.${name}`,
          packages: names.map(name => ({
            name: `${source}:@sentry/${name}`,
            version: SDK_VERSION
          })),
          version: SDK_VERSION
        }), options._metadata = metadata;
      }(opts, "browser", ["browser"], Xt.SENTRY_SDK_SOURCE || "npm"), super(opts), opts.sendClientReports && Xt.document && Xt.document.addEventListener("visibilitychange", () => {
        "hidden" === Xt.document.visibilityState && this._flushOutcomes();
      });
    }
    eventFromException(exception, hint) {
      return function (stackParser, exception, hint, attachStacktrace) {
        const event = eventFromUnknownInput(stackParser, exception, hint && hint.syntheticException || void 0, attachStacktrace);
        return addExceptionMechanism(event), event.level = "error", hint && hint.event_id && (event.event_id = hint.event_id), resolvedSyncPromise(event);
      }(this._options.stackParser, exception, hint, this._options.attachStacktrace);
    }
    eventFromMessage(message, level = "info", hint) {
      return function (stackParser, message, level = "info", hint, attachStacktrace) {
        const event = eventFromString(stackParser, message, hint && hint.syntheticException || void 0, attachStacktrace);
        return event.level = level, hint && hint.event_id && (event.event_id = hint.event_id), resolvedSyncPromise(event);
      }(this._options.stackParser, message, level, hint, this._options.attachStacktrace);
    }
    captureUserFeedback(feedback) {
      if (!this._isEnabled()) return void ($t && c.warn("SDK not enabled, will not capture user feedback."));
      const envelope = function (feedback, {
        metadata: metadata,
        tunnel: tunnel,
        dsn: dsn
      }) {
        const headers = {
            event_id: feedback.event_id,
            sent_at: new Date().toISOString(),
            ...(metadata && metadata.sdk && {
              sdk: {
                name: metadata.sdk.name,
                version: metadata.sdk.version
              }
            }),
            ...(!!tunnel && !!dsn && {
              dsn: Ft(dsn)
            })
          },
          item = function (feedback) {
            return [{
              type: "user_report"
            }, feedback];
          }(feedback);
        return wt(headers, [item]);
      }(feedback, {
        metadata: this.getSdkMetadata(),
        dsn: this.getDsn(),
        tunnel: this.getOptions().tunnel
      });
      this.sendEnvelope(envelope);
    }
    _prepareEvent(event, hint, scope) {
      return event.platform = event.platform || "javascript", super._prepareEvent(event, hint, scope);
    }
  }
  function instrumentDOM() {
    if (!_t.document) return;
    const triggerDOMHandler = Dt.bind(null, "dom"),
      globalDOMEventHandler = makeDOMEventHandler(triggerDOMHandler, !0);
    _t.document.addEventListener("click", globalDOMEventHandler, !1), _t.document.addEventListener("keypress", globalDOMEventHandler, !1), ["EventTarget", "Node"].forEach(target => {
      const proto = _t[target] && _t[target].prototype;
      proto && proto.hasOwnProperty && proto.hasOwnProperty("addEventListener") && (fill(proto, "addEventListener", function (originalAddEventListener) {
        return function (type, listener, options) {
          if ("click" === type || "keypress" == type) try {
            const el = this,
              handlers = el.__sentry_instrumentation_handlers__ = el.__sentry_instrumentation_handlers__ || {},
              handlerForType = handlers[type] = handlers[type] || {
                refCount: 0
              };
            if (!handlerForType.handler) {
              const handler = makeDOMEventHandler(triggerDOMHandler);
              handlerForType.handler = handler, originalAddEventListener.call(this, type, handler, options);
            }
            handlerForType.refCount++;
          } catch (e) {}
          return originalAddEventListener.call(this, type, listener, options);
        };
      }), fill(proto, "removeEventListener", function (originalRemoveEventListener) {
        return function (type, listener, options) {
          if ("click" === type || "keypress" == type) try {
            const el = this,
              handlers = el.__sentry_instrumentation_handlers__ || {},
              handlerForType = handlers[type];
            handlerForType && (handlerForType.refCount--, handlerForType.refCount <= 0 && (originalRemoveEventListener.call(this, type, handlerForType.handler, options), handlerForType.handler = void 0, delete handlers[type]), 0 === Object.keys(handlers).length && delete el.__sentry_instrumentation_handlers__);
          } catch (e) {}
          return originalRemoveEventListener.call(this, type, listener, options);
        };
      }));
    });
  }
  function makeDOMEventHandler(handler, globalListener = !1) {
    return event => {
      if (!event || event._sentryCaptured) return;
      const target = function (event) {
        try {
          return event.target;
        } catch (e) {
          return null;
        }
      }(event);
      if (function (eventType, target) {
        return "keypress" === eventType && (!target || !target.tagName || "INPUT" !== target.tagName && "TEXTAREA" !== target.tagName && !target.isContentEditable);
      }(event.type, target)) return;
      R(event, "_sentryCaptured", !0), target && !target._sentryId && R(target, "_sentryId", z());
      const name = "keypress" === event.type ? "input" : event.type;
      (function (event) {
        if (event.type !== lastCapturedEventType) return !1;
        try {
          if (!event.target || event.target._sentryId !== lastCapturedEventTargetId) return !1;
        } catch (e) {}
        return !0;
      })(event) || (handler({
        event: event,
        name: name,
        global: globalListener
      }), lastCapturedEventType = event.type, lastCapturedEventTargetId = target ? target._sentryId : void 0), clearTimeout(debounceTimerID), debounceTimerID = _t.setTimeout(() => {
        lastCapturedEventTargetId = void 0, lastCapturedEventType = void 0;
      }, 1e3);
    };
  }
  const SENTRY_XHR_DATA_KEY = "__sentry_xhr_v3__";
  function instrumentXHR() {
    if (!_t.XMLHttpRequest) return;
    const xhrproto = XMLHttpRequest.prototype;
    xhrproto.open = new Proxy(xhrproto.open, {
      apply(originalOpen, xhrOpenThisArg, xhrOpenArgArray) {
        const startTimestamp = 1e3 * ee(),
          method = isString(xhrOpenArgArray[0]) ? xhrOpenArgArray[0].toUpperCase() : void 0,
          url = function (url) {
            if (isString(url)) return url;
            try {
              return url.toString();
            } catch (e2) {}
          }(xhrOpenArgArray[1]);
        if (!method || !url) return originalOpen.apply(xhrOpenThisArg, xhrOpenArgArray);
        xhrOpenThisArg[SENTRY_XHR_DATA_KEY] = {
          method: method,
          url: url,
          request_headers: {}
        }, "POST" === method && url.match(/sentry_key/) && (xhrOpenThisArg.__sentry_own_request__ = !0);
        const onreadystatechangeHandler = () => {
          const xhrInfo = xhrOpenThisArg[SENTRY_XHR_DATA_KEY];
          if (xhrInfo && 4 === xhrOpenThisArg.readyState) {
            try {
              xhrInfo.status_code = xhrOpenThisArg.status;
            } catch (e) {}
            Dt("xhr", {
              endTimestamp: 1e3 * ee(),
              startTimestamp: startTimestamp,
              xhr: xhrOpenThisArg
            });
          }
        };
        return "onreadystatechange" in xhrOpenThisArg && "function" == typeof xhrOpenThisArg.onreadystatechange ? xhrOpenThisArg.onreadystatechange = new Proxy(xhrOpenThisArg.onreadystatechange, {
          apply: (originalOnreadystatechange, onreadystatechangeThisArg, onreadystatechangeArgArray) => (onreadystatechangeHandler(), originalOnreadystatechange.apply(onreadystatechangeThisArg, onreadystatechangeArgArray))
        }) : xhrOpenThisArg.addEventListener("readystatechange", onreadystatechangeHandler), xhrOpenThisArg.setRequestHeader = new Proxy(xhrOpenThisArg.setRequestHeader, {
          apply(originalSetRequestHeader, setRequestHeaderThisArg, setRequestHeaderArgArray) {
            const [header, value] = setRequestHeaderArgArray,
              xhrInfo = setRequestHeaderThisArg[SENTRY_XHR_DATA_KEY];
            return xhrInfo && isString(header) && isString(value) && (xhrInfo.request_headers[header.toLowerCase()] = value), originalSetRequestHeader.apply(setRequestHeaderThisArg, setRequestHeaderArgArray);
          }
        }), originalOpen.apply(xhrOpenThisArg, xhrOpenArgArray);
      }
    }), xhrproto.send = new Proxy(xhrproto.send, {
      apply(originalSend, sendThisArg, sendArgArray) {
        const sentryXhrData = sendThisArg[SENTRY_XHR_DATA_KEY];
        return sentryXhrData ? (void 0 !== sendArgArray[0] && (sentryXhrData.body = sendArgArray[0]), Dt("xhr", {
          startTimestamp: 1e3 * ee(),
          xhr: sendThisArg
        }), originalSend.apply(sendThisArg, sendArgArray)) : originalSend.apply(sendThisArg, sendArgArray);
      }
    });
  }
  function instrumentConsole() {
    "console" in i && CONSOLE_LEVELS.forEach(function (level) {
      level in i.console && fill(i.console, level, function (originalConsoleMethod) {
        return originalConsoleMethods[level] = originalConsoleMethod, function (...args) {
          Dt("console", {
            args: args,
            level: level
          });
          const log = originalConsoleMethods[level];
          log && log.apply(i.console, args);
        };
      });
    });
  }
  function hasProp(obj, prop) {
    return !!obj && "object" == typeof obj && !!obj[prop];
  }
  function getUrlFromResource(resource) {
    return "string" == typeof resource ? resource : resource ? hasProp(resource, "url") ? resource.url : resource.toString ? resource.toString() : "" : "";
  }
  const DEFAULT_BREADCRUMBS = 100;
  function addBreadcrumb(breadcrumb, hint) {
    const client = ye(),
      isolationScope = De();
    if (!client) return;
    const {
      beforeBreadcrumb = null,
      maxBreadcrumbs = DEFAULT_BREADCRUMBS
    } = client.getOptions();
    if (maxBreadcrumbs <= 0) return;
    const mergedBreadcrumb = {
        timestamp: dateTimestampInSeconds(),
        ...breadcrumb
      },
      finalBreadcrumb = beforeBreadcrumb ? consoleSandbox(() => beforeBreadcrumb(mergedBreadcrumb, hint)) : mergedBreadcrumb;
    null !== finalBreadcrumb && (client.emit && client.emit("beforeAddBreadcrumb", finalBreadcrumb, hint), isolationScope.addBreadcrumb(finalBreadcrumb, maxBreadcrumbs));
  }
  const validSeverityLevels = ["fatal", "error", "warning", "log", "info", "debug"];
  function getBreadcrumbLogLevelFromHttpStatusCode(statusCode) {
    return void 0 === statusCode ? void 0 : statusCode >= 400 && statusCode < 500 ? "warning" : statusCode >= 500 ? "error" : void 0;
  }
  function yn(url) {
    if (!url) return {};
    const match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
    if (!match) return {};
    const query = match[6] || "",
      fragment = match[8] || "";
    return {
      host: match[4],
      path: match[5],
      protocol: match[2],
      search: query,
      hash: fragment,
      relative: match[5] + query + fragment
    };
  }
  const breadcrumbsIntegration = (options = {}) => {
      const _options = {
        console: !0,
        dom: !0,
        fetch: !0,
        history: !0,
        sentry: !0,
        xhr: !0,
        ...options
      };
      return {
        name: "Breadcrumbs",
        setup(client) {
          var handler;
          _options.console && function (handler) {
            const type = "console";
            ft(type, handler), gt(type, instrumentConsole);
          }(function (client) {
            return function (handlerData) {
              if (ye() !== client) return;
              const breadcrumb = {
                category: "console",
                data: {
                  arguments: handlerData.args,
                  logger: "console"
                },
                level: (level = handlerData.level, "warn" === level ? "warning" : validSeverityLevels.includes(level) ? level : "log"),
                message: safeJoin(handlerData.args, " ")
              };
              var level;
              if ("assert" === handlerData.level) {
                if (!1 !== handlerData.args[0]) return;
                breadcrumb.message = `Assertion failed: ${safeJoin(handlerData.args.slice(1), " ") || "console.assert"}`, breadcrumb.data.arguments = handlerData.args.slice(1);
              }
              addBreadcrumb(breadcrumb, {
                input: handlerData.args,
                level: handlerData.level
              });
            };
          }(client)), _options.dom && (handler = function (client, dom) {
            return function (handlerData) {
              if (ye() !== client) return;
              let target,
                componentName,
                keyAttrs = "object" == typeof dom ? dom.serializeAttribute : void 0,
                maxStringLength = "object" == typeof dom && "number" == typeof dom.maxStringLength ? dom.maxStringLength : void 0;
              maxStringLength && maxStringLength > 1024 && ($t && c.warn(`\`dom.maxStringLength\` cannot exceed 1024, but a value of ${maxStringLength} was configured. Sentry will use 1024 instead.`), maxStringLength = 1024), "string" == typeof keyAttrs && (keyAttrs = [keyAttrs]);
              try {
                const event = handlerData.event,
                  element = function (event) {
                    return !!event && !!event.target;
                  }(event) ? event.target : event;
                target = htmlTreeAsString(element, {
                  keyAttrs: keyAttrs,
                  maxStringLength: maxStringLength
                }), componentName = function (elem) {
                  if (!w.HTMLElement) return null;
                  let currentElem = elem;
                  for (let i = 0; i < 5; i++) {
                    if (!currentElem) return null;
                    if (currentElem instanceof HTMLElement) {
                      if (currentElem.dataset.sentryComponent) return currentElem.dataset.sentryComponent;
                      if (currentElem.dataset.sentryElement) return currentElem.dataset.sentryElement;
                    }
                    currentElem = currentElem.parentNode;
                  }
                  return null;
                }(element);
              } catch (e) {
                target = "<unknown>";
              }
              if (0 === target.length) return;
              const breadcrumb = {
                category: `ui.${handlerData.name}`,
                message: target
              };
              componentName && (breadcrumb.data = {
                "ui.component_name": componentName
              }), addBreadcrumb(breadcrumb, {
                event: handlerData.event,
                name: handlerData.name,
                global: handlerData.global
              });
            };
          }(client, _options.dom), ft("dom", handler), gt("dom", instrumentDOM)), _options.xhr && function (handler) {
            ft("xhr", handler), gt("xhr", instrumentXHR);
          }(function (client) {
            return function (handlerData) {
              if (ye() !== client) return;
              const {
                  startTimestamp: startTimestamp,
                  endTimestamp: endTimestamp
                } = handlerData,
                sentryXhrData = handlerData.xhr[SENTRY_XHR_DATA_KEY];
              if (!startTimestamp || !endTimestamp || !sentryXhrData) return;
              const {
                  method: method,
                  url: url,
                  status_code: status_code,
                  body: body
                } = sentryXhrData,
                data = {
                  method: method,
                  url: url,
                  status_code: status_code
                },
                hint = {
                  xhr: handlerData.xhr,
                  input: body,
                  startTimestamp: startTimestamp,
                  endTimestamp: endTimestamp
                };
              addBreadcrumb({
                category: "xhr",
                data: data,
                type: "http",
                level: getBreadcrumbLogLevelFromHttpStatusCode(status_code)
              }, hint);
            };
          }(client)), _options.fetch && function (handler) {
            const type = "fetch";
            ft(type, handler), gt(type, () => function (onFetchResolved, skipNativeFetchCheck = !1) {
              skipNativeFetchCheck && !function () {
                if ("string" == typeof EdgeRuntime) return !0;
                if (!supportsFetch()) return !1;
                if (isNativeFunction(Re.fetch)) return !0;
                let result = !1;
                const doc = Re.document;
                if (doc && "function" == typeof doc.createElement) try {
                  const sandbox = doc.createElement("iframe");
                  sandbox.hidden = !0, doc.head.appendChild(sandbox), sandbox.contentWindow && sandbox.contentWindow.fetch && (result = isNativeFunction(sandbox.contentWindow.fetch)), doc.head.removeChild(sandbox);
                } catch (err) {
                  n && c.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", err);
                }
                return result;
              }() || fill(i, "fetch", function (originalFetch) {
                return function (...args) {
                  const {
                      method: method,
                      url: url
                    } = function (fetchArgs) {
                      if (0 === fetchArgs.length) return {
                        method: "GET",
                        url: ""
                      };
                      if (2 === fetchArgs.length) {
                        const [url, options] = fetchArgs;
                        return {
                          url: getUrlFromResource(url),
                          method: hasProp(options, "method") ? String(options.method).toUpperCase() : "GET"
                        };
                      }
                      const arg = fetchArgs[0];
                      return {
                        url: getUrlFromResource(arg),
                        method: hasProp(arg, "method") ? String(arg.method).toUpperCase() : "GET"
                      };
                    }(args),
                    handlerData = {
                      args: args,
                      fetchData: {
                        method: method,
                        url: url
                      },
                      startTimestamp: 1e3 * ee()
                    };
                  onFetchResolved || Dt("fetch", {
                    ...handlerData
                  });
                  const virtualStackTrace = new Error().stack;
                  return originalFetch.apply(i, args).then(async response => (onFetchResolved ? onFetchResolved(response) : Dt("fetch", {
                    ...handlerData,
                    endTimestamp: 1e3 * ee(),
                    response: response
                  }), response), error => {
                    throw Dt("fetch", {
                      ...handlerData,
                      endTimestamp: 1e3 * ee(),
                      error: error
                    }), isError(error) && void 0 === error.stack && (error.stack = virtualStackTrace, R(error, "framesToPop", 1)), error;
                  });
                };
              });
            }(void 0, undefined));
          }(function (client) {
            return function (handlerData) {
              if (ye() !== client) return;
              const {
                startTimestamp: startTimestamp,
                endTimestamp: endTimestamp
              } = handlerData;
              if (endTimestamp && (!handlerData.fetchData.url.match(/sentry_key/) || "POST" !== handlerData.fetchData.method)) if (handlerData.error) addBreadcrumb({
                category: "fetch",
                data: handlerData.fetchData,
                level: "error",
                type: "http"
              }, {
                data: handlerData.error,
                input: handlerData.args,
                startTimestamp: startTimestamp,
                endTimestamp: endTimestamp
              });else {
                const response = handlerData.response,
                  data = {
                    ...handlerData.fetchData,
                    status_code: response && response.status
                  },
                  hint = {
                    input: handlerData.args,
                    response: response,
                    startTimestamp: startTimestamp,
                    endTimestamp: endTimestamp
                  };
                addBreadcrumb({
                  category: "fetch",
                  data: data,
                  type: "http",
                  level: getBreadcrumbLogLevelFromHttpStatusCode(data.status_code)
                }, hint);
              }
            };
          }(client)), _options.history && addHistoryInstrumentationHandler(function (client) {
            return function (handlerData) {
              if (ye() !== client) return;
              let from = handlerData.from,
                to = handlerData.to;
              const parsedLoc = yn(Xt.location.href);
              let parsedFrom = from ? yn(from) : void 0;
              const parsedTo = yn(to);
              parsedFrom && parsedFrom.path || (parsedFrom = parsedLoc), parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host && (to = parsedTo.relative), parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host && (from = parsedFrom.relative), addBreadcrumb({
                category: "navigation",
                data: {
                  from: from,
                  to: to
                }
              });
            };
          }(client)), _options.sentry && client.on("beforeSendEvent", function (client) {
            return function (event) {
              ye() === client && addBreadcrumb({
                category: "sentry." + ("transaction" === event.type ? "transaction" : "event"),
                event_id: event.event_id,
                level: event.level,
                message: getEventDescription(event)
              }, {
                event: event
              });
            };
          }(client));
        }
      };
    },
    DEFAULT_EVENT_TARGET = ["EventTarget", "Window", "Node", "ApplicationCache", "AudioTrackList", "BroadcastChannel", "ChannelMergerNode", "CryptoOperation", "EventSource", "FileReader", "HTMLUnknownElement", "IDBDatabase", "IDBRequest", "IDBTransaction", "KeyOperation", "MediaController", "MessagePort", "ModalWindow", "Notification", "SVGElementInstance", "Screen", "SharedWorker", "TextTrack", "TextTrackCue", "TextTrackList", "WebSocket", "WebSocketWorker", "Worker", "XMLHttpRequest", "XMLHttpRequestEventTarget", "XMLHttpRequestUpload"],
    browserApiErrorsIntegration = (options = {}) => {
      const _options = {
        XMLHttpRequest: !0,
        eventTarget: !0,
        requestAnimationFrame: !0,
        setInterval: !0,
        setTimeout: !0,
        ...options
      };
      return {
        name: "BrowserApiErrors",
        setupOnce() {
          _options.setTimeout && fill(Xt, "setTimeout", _wrapTimeFunction), _options.setInterval && fill(Xt, "setInterval", _wrapTimeFunction), _options.requestAnimationFrame && fill(Xt, "requestAnimationFrame", _wrapRAF), _options.XMLHttpRequest && "XMLHttpRequest" in Xt && fill(XMLHttpRequest.prototype, "send", _wrapXHR);
          const eventTargetOption = _options.eventTarget;
          eventTargetOption && (Array.isArray(eventTargetOption) ? eventTargetOption : DEFAULT_EVENT_TARGET).forEach(_wrapEventTarget);
        }
      };
    };
  function _wrapTimeFunction(original) {
    return function (...args) {
      const originalCallback = args[0];
      return args[0] = wrap(originalCallback, {
        mechanism: {
          data: {
            function: getFunctionName(original)
          },
          handled: !1,
          type: "instrument"
        }
      }), original.apply(this, args);
    };
  }
  function _wrapRAF(original) {
    return function (callback) {
      return original.apply(this, [wrap(callback, {
        mechanism: {
          data: {
            function: "requestAnimationFrame",
            handler: getFunctionName(original)
          },
          handled: !1,
          type: "instrument"
        }
      })]);
    };
  }
  function _wrapXHR(originalSend) {
    return function (...args) {
      const xhr = this;
      return ["onload", "onerror", "onprogress", "onreadystatechange"].forEach(prop => {
        prop in xhr && "function" == typeof xhr[prop] && fill(xhr, prop, function (original) {
          const wrapOptions = {
              mechanism: {
                data: {
                  function: prop,
                  handler: getFunctionName(original)
                },
                handled: !1,
                type: "instrument"
              }
            },
            originalFunction = getOriginalFunction(original);
          return originalFunction && (wrapOptions.mechanism.data.handler = getFunctionName(originalFunction)), wrap(original, wrapOptions);
        });
      }), originalSend.apply(this, args);
    };
  }
  function _wrapEventTarget(target) {
    const globalObject = Xt,
      proto = globalObject[target] && globalObject[target].prototype;
    proto && proto.hasOwnProperty && proto.hasOwnProperty("addEventListener") && (fill(proto, "addEventListener", function (original) {
      return function (eventName, fn, options) {
        try {
          "function" == typeof fn.handleEvent && (fn.handleEvent = wrap(fn.handleEvent, {
            mechanism: {
              data: {
                function: "handleEvent",
                handler: getFunctionName(fn),
                target: target
              },
              handled: !1,
              type: "instrument"
            }
          }));
        } catch (err) {}
        return original.apply(this, [eventName, wrap(fn, {
          mechanism: {
            data: {
              function: "addEventListener",
              handler: getFunctionName(fn),
              target: target
            },
            handled: !1,
            type: "instrument"
          }
        }), options]);
      };
    }), fill(proto, "removeEventListener", function (originalRemoveEventListener) {
      return function (eventName, fn, options) {
        const wrappedEventHandler = fn;
        try {
          const originalEventHandler = wrappedEventHandler && wrappedEventHandler.__sentry_wrapped__;
          originalEventHandler && originalRemoveEventListener.call(this, eventName, originalEventHandler, options);
        } catch (e) {}
        return originalRemoveEventListener.call(this, eventName, wrappedEventHandler, options);
      };
    }));
  }
  let _oldOnErrorHandler = null;
  function instrumentError() {
    _oldOnErrorHandler = i.onerror, i.onerror = function (msg, url, line, column, error) {
      return Dt("error", {
        column: column,
        error: error,
        line: line,
        msg: msg,
        url: url
      }), !(!_oldOnErrorHandler || _oldOnErrorHandler.__SENTRY_LOADER__) && _oldOnErrorHandler.apply(this, arguments);
    }, i.onerror.__SENTRY_INSTRUMENTED__ = !0;
  }
  let _oldOnUnhandledRejectionHandler = null;
  function instrumentUnhandledRejection() {
    _oldOnUnhandledRejectionHandler = i.onunhandledrejection, i.onunhandledrejection = function (e) {
      return Dt("unhandledrejection", e), !(_oldOnUnhandledRejectionHandler && !_oldOnUnhandledRejectionHandler.__SENTRY_LOADER__) || _oldOnUnhandledRejectionHandler.apply(this, arguments);
    }, i.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0;
  }
  const globalHandlersIntegration = (options = {}) => {
    const _options = {
      onerror: !0,
      onunhandledrejection: !0,
      ...options
    };
    return {
      name: "GlobalHandlers",
      setupOnce() {
        Error.stackTraceLimit = 50;
      },
      setup(client) {
        _options.onerror && (function (client) {
          !function () {
            const type = "error";
            ft(type, data => {
              const {
                stackParser: stackParser,
                attachStacktrace: attachStacktrace
              } = getOptions();
              if (ye() !== client || shouldIgnoreOnError()) return;
              const {
                  msg: msg,
                  url: url,
                  line: line,
                  column: column,
                  error: error
                } = data,
                event = function (event, url, line, column) {
                  const e = event.exception = event.exception || {},
                    ev = e.values = e.values || [],
                    ev0 = ev[0] = ev[0] || {},
                    ev0s = ev0.stacktrace = ev0.stacktrace || {},
                    ev0sf = ev0s.frames = ev0s.frames || [],
                    colno = isNaN(parseInt(column, 10)) ? void 0 : column,
                    lineno = isNaN(parseInt(line, 10)) ? void 0 : line,
                    filename = isString(url) && url.length > 0 ? url : function () {
                      try {
                        return w.document.location.href;
                      } catch (oO) {
                        return "";
                      }
                    }();
                  return 0 === ev0sf.length && ev0sf.push({
                    colno: colno,
                    filename: filename,
                    function: UNKNOWN_FUNCTION,
                    in_app: !0,
                    lineno: lineno
                  }), event;
                }(eventFromUnknownInput(stackParser, error || msg, void 0, attachStacktrace, !1), url, line, column);
              event.level = "error", captureEvent(event, {
                originalException: error,
                mechanism: {
                  handled: !1,
                  type: "onerror"
                }
              });
            }), gt(type, instrumentError);
          }();
        }(client), globalHandlerLog("onerror")), _options.onunhandledrejection && (function (client) {
          !function () {
            const type = "unhandledrejection";
            ft(type, e => {
              const {
                stackParser: stackParser,
                attachStacktrace: attachStacktrace
              } = getOptions();
              if (ye() !== client || shouldIgnoreOnError()) return;
              const error = function (error) {
                  if (E(error)) return error;
                  try {
                    if ("reason" in error) return error.reason;
                    if ("detail" in error && "reason" in error.detail) return error.detail.reason;
                  } catch (e2) {}
                  return error;
                }(e),
                event = E(error) ? {
                  exception: {
                    values: [{
                      type: "UnhandledRejection",
                      value: `Non-Error promise rejection captured with value: ${String(error)}`
                    }]
                  }
                } : eventFromUnknownInput(stackParser, error, void 0, attachStacktrace, !0);
              event.level = "error", captureEvent(event, {
                originalException: error,
                mechanism: {
                  handled: !1,
                  type: "onunhandledrejection"
                }
              });
            }), gt(type, instrumentUnhandledRejection);
          }();
        }(client), globalHandlerLog("onunhandledrejection"));
      }
    };
  };
  function globalHandlerLog(type) {
    $t && c.log(`Global Handler attached: ${type}`);
  }
  function getOptions() {
    const client = ye();
    return client && client.getOptions() || {
      stackParser: () => [],
      attachStacktrace: !1
    };
  }
  function applyAggregateErrorsToEvent(exceptionFromErrorImplementation, parser, maxValueLimit = 250, key, limit, event, hint) {
    if (!(event.exception && event.exception.values && hint && isInstanceOf(hint.originalException, Error))) return;
    const originalException = event.exception.values.length > 0 ? event.exception.values[event.exception.values.length - 1] : void 0;
    var exceptions, maxValueLength;
    originalException && (event.exception.values = (exceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, hint.originalException, key, event.exception.values, originalException, 0), maxValueLength = maxValueLimit, exceptions.map(exception => (exception.value && (exception.value = truncate(exception.value, maxValueLength)), exception))));
  }
  function aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error, key, prevExceptions, exception, exceptionId) {
    if (prevExceptions.length >= limit + 1) return prevExceptions;
    let newExceptions = [...prevExceptions];
    if (isInstanceOf(error[key], Error)) {
      applyExceptionGroupFieldsForParentException(exception, exceptionId);
      const newException = exceptionFromErrorImplementation(parser, error[key]),
        newExceptionId = newExceptions.length;
      applyExceptionGroupFieldsForChildException(newException, key, newExceptionId, exceptionId), newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error[key], key, [newException, ...newExceptions], newException, newExceptionId);
    }
    return Array.isArray(error.errors) && error.errors.forEach((childError, i) => {
      if (isInstanceOf(childError, Error)) {
        applyExceptionGroupFieldsForParentException(exception, exceptionId);
        const newException = exceptionFromErrorImplementation(parser, childError),
          newExceptionId = newExceptions.length;
        applyExceptionGroupFieldsForChildException(newException, `errors[${i}]`, newExceptionId, exceptionId), newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, childError, key, [newException, ...newExceptions], newException, newExceptionId);
      }
    }), newExceptions;
  }
  function applyExceptionGroupFieldsForParentException(exception, exceptionId) {
    exception.mechanism = exception.mechanism || {
      type: "generic",
      handled: !0
    }, exception.mechanism = {
      ...exception.mechanism,
      ...("AggregateError" === exception.type && {
        is_exception_group: !0
      }),
      exception_id: exceptionId
    };
  }
  function applyExceptionGroupFieldsForChildException(exception, source, exceptionId, parentId) {
    exception.mechanism = exception.mechanism || {
      type: "generic",
      handled: !0
    }, exception.mechanism = {
      ...exception.mechanism,
      type: "chained",
      source: source,
      exception_id: exceptionId,
      parent_id: parentId
    };
  }
  const linkedErrorsIntegration = (options = {}) => {
    const limit = options.limit || 5,
      key = options.key || "cause";
    return {
      name: "LinkedErrors",
      preprocessEvent(event, hint, client) {
        const options = client.getOptions();
        applyAggregateErrorsToEvent(exceptionFromError, options.stackParser, options.maxValueLength, key, limit, event, hint);
      }
    };
  };
  function createFrame(filename, func, lineno, colno) {
    const frame = {
      filename: filename,
      function: "<anonymous>" === func ? UNKNOWN_FUNCTION : func,
      in_app: !0
    };
    return void 0 !== lineno && (frame.lineno = lineno), void 0 !== colno && (frame.colno = colno), frame;
  }
  const chromeRegexNoFnName = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i,
    chromeRegex = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
    chromeEvalRegex = /\((\S*)(?::(\d+))(?::(\d+))\)/,
    geckoREgex = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,
    geckoEvalRegex = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
    Vn = createStackParser([30, line => {
      const noFnParts = chromeRegexNoFnName.exec(line);
      if (noFnParts) {
        const [, filename, line, col] = noFnParts;
        return createFrame(filename, UNKNOWN_FUNCTION, +line, +col);
      }
      const parts = chromeRegex.exec(line);
      if (parts) {
        if (parts[2] && 0 === parts[2].indexOf("eval")) {
          const subMatch = chromeEvalRegex.exec(parts[2]);
          subMatch && (parts[2] = subMatch[1], parts[3] = subMatch[2], parts[4] = subMatch[3]);
        }
        const [func, filename] = extractSafariExtensionDetails(parts[1] || UNKNOWN_FUNCTION, parts[2]);
        return createFrame(filename, func, parts[3] ? +parts[3] : void 0, parts[4] ? +parts[4] : void 0);
      }
    }], [50, line => {
      const parts = geckoREgex.exec(line);
      if (parts) {
        if (parts[3] && parts[3].indexOf(" > eval") > -1) {
          const subMatch = geckoEvalRegex.exec(parts[3]);
          subMatch && (parts[1] = parts[1] || "eval", parts[3] = subMatch[1], parts[4] = subMatch[2], parts[5] = "");
        }
        let filename = parts[3],
          func = parts[1] || UNKNOWN_FUNCTION;
        return [func, filename] = extractSafariExtensionDetails(func, filename), createFrame(filename, func, parts[4] ? +parts[4] : void 0, parts[5] ? +parts[5] : void 0);
      }
    }]),
    extractSafariExtensionDetails = (func, filename) => {
      const isSafariExtension = -1 !== func.indexOf("safari-extension"),
        isSafariWebExtension = -1 !== func.indexOf("safari-web-extension");
      return isSafariExtension || isSafariWebExtension ? [-1 !== func.indexOf("@") ? func.split("@")[0] : UNKNOWN_FUNCTION, isSafariExtension ? `safari-extension:${filename}` : `safari-web-extension:${filename}`] : [func, filename];
    },
    Gn = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__,
    cachedImplementations = {};
  function clearCachedImplementation(name) {
    cachedImplementations[name] = void 0;
  }
  function createTransport(options, makeRequest, buffer = function (limit) {
    const buffer = [];
    function remove(task) {
      return buffer.splice(buffer.indexOf(task), 1)[0] || Promise.resolve(void 0);
    }
    return {
      $: buffer,
      add: function (taskProducer) {
        if (!(void 0 === limit || buffer.length < limit)) return rejectedSyncPromise(new SentryError("Not adding Promise because buffer limit was reached."));
        const task = taskProducer();
        return -1 === buffer.indexOf(task) && buffer.push(task), task.then(() => remove(task)).then(null, () => remove(task).then(null, () => {})), task;
      },
      drain: function (timeout) {
        return new SyncPromise((resolve, reject) => {
          let counter = buffer.length;
          if (!counter) return resolve(!0);
          const capturedSetTimeout = setTimeout(() => {
            timeout && timeout > 0 && resolve(!1);
          }, timeout);
          buffer.forEach(item => {
            resolvedSyncPromise(item).then(() => {
              --counter || (clearTimeout(capturedSetTimeout), resolve(!0));
            }, reject);
          });
        });
      }
    };
  }(options.bufferSize || 64)) {
    let rateLimits = {};
    return {
      send: function (envelope) {
        const filteredEnvelopeItems = [];
        if (forEachEnvelopeItem(envelope, (item, type) => {
          const dataCategory = envelopeItemTypeToDataCategory(type);
          if (function (limits, dataCategory, now = Date.now()) {
            return function (limits, dataCategory) {
              return limits[dataCategory] || limits.all || 0;
            }(limits, dataCategory) > now;
          }(rateLimits, dataCategory)) {
            const event = getEventForEnvelopeItem(item, type);
            options.recordDroppedEvent("ratelimit_backoff", dataCategory, event);
          } else filteredEnvelopeItems.push(item);
        }), 0 === filteredEnvelopeItems.length) return resolvedSyncPromise({});
        const filteredEnvelope = wt(envelope[0], filteredEnvelopeItems),
          recordEnvelopeLoss = reason => {
            forEachEnvelopeItem(filteredEnvelope, (item, type) => {
              const event = getEventForEnvelopeItem(item, type);
              options.recordDroppedEvent(reason, envelopeItemTypeToDataCategory(type), event);
            });
          };
        return buffer.add(() => makeRequest({
          body: serializeEnvelope(filteredEnvelope)
        }).then(response => (void 0 !== response.statusCode && (response.statusCode < 200 || response.statusCode >= 300) && t && c.warn(`Sentry responded with status code ${response.statusCode} to sent event.`), rateLimits = function (limits, {
          statusCode: statusCode,
          headers: headers
        }, now = Date.now()) {
          const updatedRateLimits = {
              ...limits
            },
            rateLimitHeader = headers && headers["x-sentry-rate-limits"],
            retryAfterHeader = headers && headers["retry-after"];
          if (rateLimitHeader) for (const limit of rateLimitHeader.trim().split(",")) {
            const [retryAfter, categories,,, namespaces] = limit.split(":", 5),
              headerDelay = parseInt(retryAfter, 10),
              delay = 1e3 * (isNaN(headerDelay) ? 60 : headerDelay);
            if (categories) for (const category of categories.split(";")) "metric_bucket" === category && namespaces && !namespaces.split(";").includes("custom") || (updatedRateLimits[category] = now + delay);else updatedRateLimits.all = now + delay;
          } else retryAfterHeader ? updatedRateLimits.all = now + function (header, now = Date.now()) {
            const headerDelay = parseInt(`${header}`, 10);
            if (!isNaN(headerDelay)) return 1e3 * headerDelay;
            const headerDate = Date.parse(`${header}`);
            return isNaN(headerDate) ? 6e4 : headerDate - now;
          }(retryAfterHeader, now) : 429 === statusCode && (updatedRateLimits.all = now + 6e4);
          return updatedRateLimits;
        }(rateLimits, response), response), error => {
          throw recordEnvelopeLoss("network_error"), error;
        })).then(result => result, error => {
          if (error instanceof SentryError) return t && c.error("Skipped sending event because buffer is full."), recordEnvelopeLoss("queue_overflow"), resolvedSyncPromise({});
          throw error;
        });
      },
      flush: timeout => buffer.drain(timeout)
    };
  }
  function getEventForEnvelopeItem(item, type) {
    if ("event" === type || "transaction" === type) return Array.isArray(item) ? item[1] : void 0;
  }
  function Jn(options, nativeFetch = function (name) {
    const cached = cachedImplementations[name];
    if (cached) return cached;
    let impl = _t[name];
    if (isNativeFunction(impl)) return cachedImplementations[name] = impl.bind(_t);
    const document2 = _t.document;
    if (document2 && "function" == typeof document2.createElement) try {
      const sandbox = document2.createElement("iframe");
      sandbox.hidden = !0, document2.head.appendChild(sandbox);
      const contentWindow = sandbox.contentWindow;
      contentWindow && contentWindow[name] && (impl = contentWindow[name]), document2.head.removeChild(sandbox);
    } catch (e) {
      Gn && c.warn(`Could not create sandbox iframe for ${name} check, bailing to window.${name}: `, e);
    }
    return impl ? cachedImplementations[name] = impl.bind(_t) : impl;
  }("fetch")) {
    let pendingBodySize = 0,
      pendingCount = 0;
    return createTransport(options, function (request) {
      const requestSize = request.body.length;
      pendingBodySize += requestSize, pendingCount++;
      const requestOptions = {
        body: request.body,
        method: "POST",
        referrerPolicy: "origin",
        headers: options.headers,
        keepalive: pendingBodySize <= 6e4 && pendingCount < 15,
        ...options.fetchOptions
      };
      if (!nativeFetch) return clearCachedImplementation("fetch"), rejectedSyncPromise("No fetch implementation available");
      try {
        return nativeFetch(options.url, requestOptions).then(response => (pendingBodySize -= requestSize, pendingCount--, {
          statusCode: response.status,
          headers: {
            "x-sentry-rate-limits": response.headers.get("X-Sentry-Rate-Limits"),
            "retry-after": response.headers.get("Retry-After")
          }
        }));
      } catch (e) {
        return clearCachedImplementation("fetch"), pendingBodySize -= requestSize, pendingCount--, rejectedSyncPromise(e);
      }
    });
  }
  function init(browserOptions = {}) {
    const options = function (optionsArg = {}) {
      const defaultOptions = {
        defaultIntegrations: [inboundFiltersIntegration(), functionToStringIntegration(), browserApiErrorsIntegration(), breadcrumbsIntegration(), globalHandlersIntegration(), linkedErrorsIntegration(), dedupeIntegration(), {
          name: "HttpContext",
          preprocessEvent(event) {
            if (!Xt.navigator && !Xt.location && !Xt.document) return;
            const url = event.request && event.request.url || Xt.location && Xt.location.href,
              {
                referrer: referrer
              } = Xt.document || {},
              {
                userAgent: userAgent
              } = Xt.navigator || {},
              headers = {
                ...(event.request && event.request.headers),
                ...(referrer && {
                  Referer: referrer
                }),
                ...(userAgent && {
                  "User-Agent": userAgent
                })
              },
              request = {
                ...event.request,
                ...(url && {
                  url: url
                }),
                headers: headers
              };
            event.request = request;
          }
        }],
        release: "string" == typeof __SENTRY_RELEASE__ ? __SENTRY_RELEASE__ : Xt.SENTRY_RELEASE && Xt.SENTRY_RELEASE.id ? Xt.SENTRY_RELEASE.id : void 0,
        autoSessionTracking: !0,
        sendClientReports: !0
      };
      return null == optionsArg.defaultIntegrations && delete optionsArg.defaultIntegrations, {
        ...defaultOptions,
        ...optionsArg
      };
    }(browserOptions);
    if (!options.skipBrowserExtensionCheck && function () {
      const windowWithMaybeExtension = void 0 !== Xt.window && Xt;
      if (!windowWithMaybeExtension) return !1;
      const extensionObject = windowWithMaybeExtension[windowWithMaybeExtension.chrome ? "chrome" : "browser"],
        runtimeId = extensionObject && extensionObject.runtime && extensionObject.runtime.id,
        href = Xt.location && Xt.location.href || "",
        isDedicatedExtensionPage = !!runtimeId && Xt === Xt.top && ["chrome-extension:", "moz-extension:", "ms-browser-extension:", "safari-web-extension:"].some(protocol => href.startsWith(`${protocol}//`)),
        isNWjs = void 0 !== windowWithMaybeExtension.nw;
      return !!runtimeId && !isDedicatedExtensionPage && !isNWjs;
    }()) return void consoleSandbox(() => {
      console.error("[Sentry] You cannot run Sentry this way in a browser extension, check: https://docs.sentry.io/platforms/javascript/best-practices/browser-extensions/");
    });
    $t && (supportsFetch() || c.warn("No Fetch API detected. The Sentry SDK requires a Fetch API compatible environment to send events. Please add a Fetch API polyfill."));
    const clientOptions = {
      ...options,
      stackParser: (stackParser = options.stackParser || Vn, Array.isArray(stackParser) ? createStackParser(...stackParser) : stackParser),
      integrations: getIntegrationsToSetup(options),
      transport: options.transport || Jn
    };
    var stackParser;
    const client = function (clientClass, options) {
      !0 === options.debug && (t ? c.enable() : consoleSandbox(() => {
        console.warn("[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.");
      })), ge().update(options.initialScope);
      const client = new clientClass(options);
      return function (client) {
        ge().setClient(client);
      }(client), client.init(), client;
    }(rn, clientOptions);
    return options.autoSessionTracking && (void 0 !== Xt.document ? (startSession({
      ignoreDuration: !0
    }), captureSession(), addHistoryInstrumentationHandler(({
      from: from,
      to: to
    }) => {
      void 0 !== from && from !== to && (startSession({
        ignoreDuration: !0
      }), captureSession());
    })) : $t && c.warn("Session tracking in non-browser environment with @sentry/browser is not supported.")), client;
  }
  var PlatformKey, CachedStorageIds, UpdaterConstants, ActivityReportingConstants, DMSManagerConstants, FzboxConstants, KeepAliveConstants, FilterMethod, FilteringConstants, FallbackVerdictStoreConstants, VerdictStoreConstants, YouTubeVerdictStoreConstants, ConfigConstants, FeatureFlags, ChatConstants, ConfigFetcherConstants, TabsConstants, MainConstants, CompanionConstants, SystemConfigConstants, DelegationConstants, BrowserConstants, DelegationReporting, ContentAwareConstants, ContentAwareCategories, ContentAwareIECMessageTypes, ContentAwareLicenseStatus, AuthenticateConstants, AttestationConstants, ConnectionsConstants, ScreenshotPersisterConstants, SchedulesConstants, UniqueScheduleIds, EventTypes, Ns, LogLevel, MessageTypes, CompanionFeatures, LogLevelTypes, BrowserTypes;
  function checkMessageType(type) {
    return message => message.type === type;
  }
  !function (PlatformKey) {
    PlatformKey.Mac = "mac", PlatformKey.Win = "win", PlatformKey.Android = "android", PlatformKey.Cros = "cros", PlatformKey.Linux = "linux", PlatformKey.OpenBSD = "openbsd", PlatformKey.Fuchsia = "fuchsia", PlatformKey.Unknown = "unknown";
  }(PlatformKey || (PlatformKey = {})), PlatformKey.Mac, PlatformKey.Win, PlatformKey.Android, PlatformKey.Cros, PlatformKey.Linux, PlatformKey.OpenBSD, PlatformKey.Fuchsia, PlatformKey.Unknown, function (CachedStorageIds) {
    CachedStorageIds.FirestoreDataCacheId = "lw_firestore_doc_data_cache_id";
  }(CachedStorageIds || (CachedStorageIds = {})), function (UpdaterConstants) {
    UpdaterConstants.FcmMessagesCacheId = "lw_updater_fcm_messages_cache_id", UpdaterConstants.GeneralCacheId = "lw_updater_general_cache_id", UpdaterConstants.RegistrationCacheId = "lw_updater_registration_cache";
  }(UpdaterConstants || (UpdaterConstants = {})), function (ActivityReportingConstants) {
    ActivityReportingConstants.SchoolTimeRefreshInterval = "lw_school_time_refresh";
  }(ActivityReportingConstants || (ActivityReportingConstants = {})), function (DMSManagerConstants) {
    DMSManagerConstants.DmsDataCacheId = "lw_dms_data_cache", DMSManagerConstants.DmsManagerConfigCacheId = "lw_dms_manager_config_cache", DMSManagerConstants.CheckInDeviceInterval = "lw_dms_check_in", DMSManagerConstants.RetryDMSRegTimeout = "lw_retry_dms_registration_timeout", DMSManagerConstants[DMSManagerConstants.CheckInDeviceElapsed_ms = 3e5] = "CheckInDeviceElapsed_ms";
  }(DMSManagerConstants || (DMSManagerConstants = {})), function (FzboxConstants) {
    FzboxConstants[FzboxConstants.WalledGardenBasedInterval = 3e4] = "WalledGardenBasedInterval", FzboxConstants[FzboxConstants.DefaultPollingInterval = 3e5] = "DefaultPollingInterval";
  }(FzboxConstants || (FzboxConstants = {})), function (KeepAliveConstants) {
    KeepAliveConstants.KeepAliveCacheId = "lw_keep_alive_cache_id";
  }(KeepAliveConstants || (KeepAliveConstants = {})), function (FilterMethod) {
    FilterMethod.VerdictClientFallback = "client_fallback", FilterMethod.Bypass = "bypass", FilterMethod.LocalBlocklist = "local_blocklist";
  }(FilterMethod || (FilterMethod = {})), function (FilteringConstants) {
    FilteringConstants.HandleVerdictQueueInterval = "lw_handle_verdict_queue_interval", FilteringConstants.EvictOldResponsesInterval = "lw_evict_old_responses", FilteringConstants.VerdictRawResponseCacheId = "lw_verdict_raw_response_cache", FilteringConstants.FallbackVerdictsCacheId = "lw_fallback_verdicts_cache", FilteringConstants.VerdictResponseTimeCacheId = "verdict_response_time_cache", FilteringConstants.VerdictYoutubeQueryCacheId = "verdict_youtube_query_cache", FilteringConstants.VerdictClientFallback = "client_fallback", FilteringConstants.VerdictClientMethodBypass = "bypass", FilteringConstants.CustomHeaderCacheId = "lw_custom_header_cache", FilteringConstants.CustomHeaderCacheCleanIntervalId = "lw_custom_header_cache_interval_id";
  }(FilteringConstants || (FilteringConstants = {})), function (FallbackVerdictStoreConstants) {
    FallbackVerdictStoreConstants.PurgeOldVerdictEntries = "purge_old_verdict_entries";
  }(FallbackVerdictStoreConstants || (FallbackVerdictStoreConstants = {})), function (VerdictStoreConstants) {
    VerdictStoreConstants.EvictOldResponsesInterval = "lw_evict_old_responses", VerdictStoreConstants.VerdictResponseCacheId = "lw_verdict_response_cache";
  }(VerdictStoreConstants || (VerdictStoreConstants = {})), function (YouTubeVerdictStoreConstants) {
    YouTubeVerdictStoreConstants.EvictOldYoutubeVerdictResponsesInterval = "lw_evict_old_youtube_verdict_responses", YouTubeVerdictStoreConstants.YouTubeVerdictResponseCacheId = "lw_youtube_verdict_response_cache";
  }(YouTubeVerdictStoreConstants || (YouTubeVerdictStoreConstants = {})), function (ConfigConstants) {
    ConfigConstants.ConfigurationCacheId = "lw_configuration_cache", ConfigConstants[ConfigConstants.ConfigLoadTimeout_ms = 1e4] = "ConfigLoadTimeout_ms", ConfigConstants[ConfigConstants.ConfigFetchInitialInterval = 1e3] = "ConfigFetchInitialInterval", ConfigConstants[ConfigConstants.ConfigFetchMaxInterval = 3e4] = "ConfigFetchMaxInterval", ConfigConstants[ConfigConstants.ConfigFetchMaxElapsedTime = 9e4] = "ConfigFetchMaxElapsedTime", ConfigConstants[ConfigConstants.ConfigFetchRandomizationFactor = .1] = "ConfigFetchRandomizationFactor", ConfigConstants[ConfigConstants.ConfigFetchMultiplier = 3] = "ConfigFetchMultiplier", ConfigConstants[ConfigConstants.ConfigFetchMaxRetries = 8] = "ConfigFetchMaxRetries";
  }(ConfigConstants || (ConfigConstants = {})), function (FeatureFlags) {
    FeatureFlags.ClasswizeTeacherStudentChat = "classwize-teacher-student-chat", FeatureFlags.UnifiedObservability = "unified_observability", FeatureFlags.VirtualClockEnabled = "virtual_clock_enabled", FeatureFlags.EnableCTIRUFilterLists = "enable_ctiru_filter_lists", FeatureFlags.EnableIWFFilterLists = "enable_iwf_filter_lists";
  }(FeatureFlags || (FeatureFlags = {})), function (ChatConstants) {
    ChatConstants.ChatDataCacheId = "lw_chat_data_cache", ChatConstants.OpenChatTimeout = "lw_open_chat_timeout";
  }(ChatConstants || (ChatConstants = {})), function (ConfigFetcherConstants) {
    ConfigFetcherConstants.ClassConfigRefreshTimeout = "lw_class_config_refresh";
  }(ConfigFetcherConstants || (ConfigFetcherConstants = {})), function (TabsConstants) {
    TabsConstants.FocusPauseCheckTimeout = "lw_tabs_focuslock_check", TabsConstants.ScreenshotUploadInterval = "lw_screenshot_upload_interval", TabsConstants.TabsDataCacheId = "lw_tabs_data_cache";
  }(TabsConstants || (TabsConstants = {})), function (MainConstants) {
    MainConstants.PeriodicLoginInterval = "lw_periodic_login", MainConstants.WhoamiLoginInterval = "lw_whoami_login", MainConstants.FzboxPollInterval = "lw_fzbox_poll", MainConstants.PeriodicLogsUploadInterval = "lw_periodic_logs_upload_interval", MainConstants.MainDataCacheId = "lw_main_data_cache", MainConstants.DevDataCacheId = "lw_dev_data_cache", MainConstants.LoadingConfigKey = "lw_loading_config_key", MainConstants.ConfigUpdateBackoffRetryStateKey = "lw_config_update_backoff_retry_state_key", MainConstants.TabLimitLastNotifiedKey = "lw_tab_limit_last_notified_key", MainConstants.RemainingUpdatesKey = "lw_remaining_updates_key", MainConstants.DevBuildReloadedKey = "lw_dev_build_reloaded_key", MainConstants[MainConstants.ResourceLimitThresholdCheckInterval = 72e5] = "ResourceLimitThresholdCheckInterval";
  }(MainConstants || (MainConstants = {})), function (CompanionConstants) {
    CompanionConstants.CacheId = "lw_companion_cache", CompanionConstants[CompanionConstants.MaxReconnectionAttempts = 5] = "MaxReconnectionAttempts", CompanionConstants[CompanionConstants.DeltaTimeout = 5e3] = "DeltaTimeout", CompanionConstants[CompanionConstants.MaxRetryRegistrationInterval_ms = 3e4] = "MaxRetryRegistrationInterval_ms";
  }(CompanionConstants || (CompanionConstants = {})), function (SystemConfigConstants) {
    SystemConfigConstants.CacheId = "lw_system_config_cache";
  }(SystemConfigConstants || (SystemConfigConstants = {})), function (DelegationConstants) {
    DelegationConstants.CacheId = "lw_delegation_config_cache", DelegationConstants.DelegationChangeScheduleId = "lw_delegation_change_schedule_id", DelegationConstants.DelegationChangeIntervalId = "lw_delegation_change_interval_id";
  }(DelegationConstants || (DelegationConstants = {})), function (BrowserConstants) {
    BrowserConstants.serviceWorkerStartTimeKey = "lw_service_worker_start_key", BrowserConstants.sentryReportingWindowStartKey = "lw_sentry_reporting_window_start_key", BrowserConstants.sentryReportingWindowEndKey = "lw_sentry_reporting_window_end_key";
  }(BrowserConstants || (BrowserConstants = {})), function (DelegationReporting) {
    DelegationReporting.ALL = "all", DelegationReporting.BLOCKED = "blocked", DelegationReporting.NONE = "none";
  }(DelegationReporting || (DelegationReporting = {})), function (ContentAwareConstants) {
    ContentAwareConstants.CacheId = "lw_content_aware_config_cache";
  }(ContentAwareConstants || (ContentAwareConstants = {})), function (ContentAwareCategories) {
    ContentAwareCategories.goreImage = "goreImage", ContentAwareCategories.pornImage = "pornImage", ContentAwareCategories.swimwearImage = "swimwearImage", ContentAwareCategories.goreVideo = "goreVideo", ContentAwareCategories.pornVideo = "pornVideo", ContentAwareCategories.swimwearVideo = "swimwearVideo";
  }(ContentAwareCategories || (ContentAwareCategories = {})), function (ContentAwareIECMessageTypes) {
    ContentAwareIECMessageTypes.login = "LOGIN", ContentAwareIECMessageTypes.logout = "LOGOUT", ContentAwareIECMessageTypes.isLoggedIn = "IS_LOGGED_IN", ContentAwareIECMessageTypes.resetConfig = "RESET-CONFIG", ContentAwareIECMessageTypes.UpdateDynamicConfig = "UPDATE-CONFIG-ALL";
  }(ContentAwareIECMessageTypes || (ContentAwareIECMessageTypes = {})), function (ContentAwareLicenseStatus) {
    ContentAwareLicenseStatus.active = "ACTIVE", ContentAwareLicenseStatus.suspended = "SUSPENDED";
  }(ContentAwareLicenseStatus || (ContentAwareLicenseStatus = {})), function (AuthenticateConstants) {
    AuthenticateConstants.PartialFailedCacheId = "lw_partial_failed_cache", AuthenticateConstants.AuthenticationData = "lw_authentication_data_cache", AuthenticateConstants.AuthTokenKey = "auth_token";
  }(AuthenticateConstants || (AuthenticateConstants = {})), function (AttestationConstants) {
    AttestationConstants.AttestationData = "lw_attestation_data_cache", AttestationConstants.TelemetryAttestationTokenKey = "telemetry_attestation_token";
  }(AttestationConstants || (AttestationConstants = {})), function (ConnectionsConstants) {
    ConnectionsConstants.ConnectionsCacheId = "lw_connections_cache", ConnectionsConstants.ConnectionsUploadInterval = "lw_Connections_upload_interval", ConnectionsConstants.TabsCacheId = "lw_tabs_cache", ConnectionsConstants.UploadInfoCacheId = "lw_upload_info_cache", ConnectionsConstants.mainFrameRequestType = "main_frame", ConnectionsConstants.eventTypeSendHeaders = "sendHeaders", ConnectionsConstants.eventTypeBeforeRequest = "beforeRequest", ConnectionsConstants.eventTypeSendRedirect = "sendRedirect", ConnectionsConstants.eventTypeHeadersReceived = "headersReceived", ConnectionsConstants.eventTypeCompleted = "completed";
  }(ConnectionsConstants || (ConnectionsConstants = {})), function (ScreenshotPersisterConstants) {
    ScreenshotPersisterConstants.LastScreenshotCacheId = "last_screenshot_cache";
  }(ScreenshotPersisterConstants || (ScreenshotPersisterConstants = {})), function (SchedulesConstants) {
    SchedulesConstants.SchedulesDataCacheId = "lw_schedule_manager_data_cache_id";
  }(SchedulesConstants || (SchedulesConstants = {})), function (UniqueScheduleIds) {
    UniqueScheduleIds.ConfigUpdate = "config_update_with_delay", UniqueScheduleIds.ConfigUpdateBackoffRetry = "config_update_backoff_retry", UniqueScheduleIds.CaptureTabAndSend = "capture_tab_and_send", UniqueScheduleIds.SendRuntimeMessage = "send_runtime_message", UniqueScheduleIds.PrintBlockedMessage = "print_blocked_message", UniqueScheduleIds.CreateNewChromeTab = "create_new_chrome_tab";
  }(UniqueScheduleIds || (UniqueScheduleIds = {})), function (EventTypes) {
    EventTypes.CONFIG_UPDATE = "CONFIG_UPDATE", EventTypes.OPEN_TAB = "OPEN_TAB", EventTypes.CLOSE_TAB = "CLOSE_TAB", EventTypes.MESSAGE = "MESSAGE", EventTypes.CLASS_STARTED = "CLASS_STARTED", EventTypes.POLICY_UPDATE = "POLICY_UPDATE", EventTypes.INIT_P2P = "INIT_P2P", EventTypes.HEARTBEAT = "HEARTBEAT";
  }(EventTypes || (EventTypes = {})), (LogLevelTypes = Ns || (Ns = {})).Error = "logging__error", LogLevelTypes.Warning = "logging__warning", LogLevelTypes.Message = "logging__message", LogLevelTypes.Debug = "logging__debug", function (LogLevel) {
    LogLevel.INFO = "INFO", LogLevel.WARN = "WARN", LogLevel.ERROR = "ERROR", LogLevel.DEBUG = "DEBUG";
  }(LogLevel || (LogLevel = {})), function (MessageTypes) {
    MessageTypes.InitOffscreenDocument = "init_offscreen_socument_message", MessageTypes.RegisterClasswizeEventFail = "register_extension_with_native_agent_classwize_events_fail", MessageTypes.RegisterClasswizeEventMessage = "register_extension_with_native_agent_classwize_events_Message", MessageTypes.IsExtensionRegistered = "is_extension_registered_with_native_agent", MessageTypes.CompanionMessage = "message_from_native_agent", MessageTypes.RecoverCompanionStream = "recover_companion_stream", MessageTypes.RetryRegistration = "retry_registration_with_native_agent", MessageTypes.SetUpIpAddressChangeDetection = "ip_address_change_detection", MessageTypes.TabsActivated = "tabs_activated_message", MessageTypes.P2PInitSignaler = "p2p_init_signaler_message", MessageTypes.P2PSetCloseTimeouts = "p2p_set_close_timeouts_message", MessageTypes.P2PGetScreenshot = "p2p_get_screenshot_message", MessageTypes.P2PGetTabs = "p2p_get_tabs_message", MessageTypes.UtilLocalIpUpdated = "util_local_ip_updated_message", MessageTypes.UtilResizeAndCompressImage = "util_resize_and_compress_image", MessageTypes.UtilCompositeImagesHorizontally = "util_composite_images_horizontally", MessageTypes.BroadcastWakeUpCall = "cachescheduler_broadcast_wakeup_call", MessageTypes.BroadcastScheduleTime = "schedule-time-ee236fce-1426-4975-9d56-2ce4e8becd02", MessageTypes.ChatBubbleStatus = "chat_status", MessageTypes.ChatInfo = "chat_info", MessageTypes.ChatGetLastMessage = "last_chat_message", MessageTypes.ChatClearLastMessage = "clear_last_chat_message", MessageTypes.UIGetStatus = "ui_get_status", MessageTypes.UIReloadConfig = "ui_reload_config", MessageTypes.UISendLogs = "ui_send_logs", MessageTypes.UserOverride = "user_override", MessageTypes.UpdaterNewMessage = "updater_new_message", MessageTypes.GetSafeguardVerdict = "get_safe_guard_verdict", MessageTypes.RedirectWebPage = "redirect_web_page", MessageTypes.EventMessage = "event_service_message", MessageTypes.InitAutoAuth = "init_auto_auth", MessageTypes.GetAuthCookie = "get_auth_cookie", MessageTypes.GetAuthToken = "get_auth_token", MessageTypes.GetAttestationToken = "get_attestation_token", MessageTypes.UploadLogData = "upload_log_data", MessageTypes.UpdateOffscreenConfig = "update_offscreen_config", MessageTypes.MainConfigUpdated = "main_config_updated", MessageTypes.OffScreenLogMessage = "Off_screen_log_message", MessageTypes.Token = "TOKEN", MessageTypes.ChatConfigUpdate = "CHAT_CONFIG_UPDATE", MessageTypes.UpdateTotalUnreadCount = "UPDATE_TOTAL_UNREAD_COUNT", MessageTypes.OpenChatClassroom = "OPEN_CHAT_CLASSROOM", MessageTypes.GoogleAuthenticate = "GOOGLE_AUTHENTICATE", MessageTypes.NativeTokenAuthenticate = "NATIVE_TOKEN_AUTHENTICATE", MessageTypes.GetBrowserType = "get_browser_type", MessageTypes.GetBrowserDetails = "get_browser_details", MessageTypes.CheckIfDomainIsBlocked = "check_if_domain_is_blocked", MessageTypes.ExtractFallbackDomains = "extract_fallback_domains", MessageTypes.LogMessage = "log_message", MessageTypes.InitOffscreenOpenTelemetry = "init-offscreen-opentelemetry", MessageTypes.SentryGetUserDetails = "sentry-get-user-details", MessageTypes.ChatLogMessage = "chat-log-message", MessageTypes.ReloadPopUp = "reload-popup", MessageTypes.PopupIsReloading = "popup-is-reloading", MessageTypes.PopupIsNotReloading = "popup-is-not-reloading", MessageTypes.ProxiedFetch = "proxied_fetch", MessageTypes.TabVerdictUpdated = "tab_verdict_updated", MessageTypes.GetCompanionConnectionInfo = "get_companion_connection_info_message", MessageTypes.UpdateCompanionStatus = "update_companion_status", MessageTypes.UnenrollCompanionMessage = "unenroll_companion_message", MessageTypes.RequestConfigUpdate = "request_config_update", MessageTypes.InternetBackOnline = "internet_back_online", MessageTypes.EmbeddedYoutubeVideoVerdict = "embedded_youtube_video_verdict";
  }(MessageTypes || (MessageTypes = {})), function (CompanionFeatures) {
    CompanionFeatures.companion = "companion", CompanionFeatures.companionLite = "companion_lite", CompanionFeatures.proxyFilter = "proxy_filter", CompanionFeatures.dns_filter = "dns_filter", CompanionFeatures.classroom = "classroom", CompanionFeatures.liteModeEnabled = "companion-mode-lite-enabled";
  }(CompanionFeatures || (CompanionFeatures = {})), function (BrowserTypes) {
    BrowserTypes.chrome = "chrome", BrowserTypes.edge = "edge";
  }(BrowserTypes || (BrowserTypes = {})), checkMessageType(MessageTypes.GetSafeguardVerdict), checkMessageType(MessageTypes.ProxiedFetch);
  const sharedSentryConfig = {
    dsn: "https://c17cd3300c4e109ad958146b698040aa@o4507960794546176.ingest.us.sentry.io/4507960797102080",
    tracesSampleRate: 1,
    sampleRate: 1,
    ignoreErrors: ["Could not establish connection. Receiving end does not exist.", /^Cannot access contents of url/i, /message channel closed before a response was received/i]
  };
  function State(token) {
    this.j = {}, this.jr = [], this.jd = null, this.t = token;
  }
  (extensionDetails => {
    const releaseName = (extensionDetails => {
      var t;
      if (!(extensionDetails && extensionDetails.extensionVersion && extensionDetails.extensionName && extensionDetails.buildENV)) return;
      const lastVersionNumber = null == extensionDetails ? void 0 : extensionDetails.extensionVersion,
        productName = null === (t = null == extensionDetails ? void 0 : extensionDetails.extensionName) || void 0 === t ? void 0 : t.toLowerCase().replace(/ /g, "-");
      let buildType = "prod";
      return "development" === (null == extensionDetails ? void 0 : extensionDetails.buildENV) && (buildType = "local-dev"), `${productName}.${buildType}@${lastVersionNumber}`;
    })(extensionDetails);
    init(Object.assign(Object.assign({}, sharedSentryConfig), {
      release: releaseName
    }));
  })((() => {
    var e;
    if (void 0 === (null === (e = null === chrome || void 0 === chrome ? void 0 : chrome.runtime) || void 0 === e ? void 0 : e.getManifest)) return;
    const manifest = chrome.runtime.getManifest();
    return {
      extensionVersion: manifest.version,
      extensionName: manifest.name,
      buildENV: "production"
    };
  })()), function () {
    var e, t, n, s;
    e = this, t = void 0, s = function* () {
      chrome.runtime.sendMessage({
        type: MessageTypes.SentryGetUserDetails
      }, response => {
        var details, value, user;
        response && (details = response).userIdentifier && details.applianceId && (user = {
          id: details.userIdentifier
        }, De().setUser(user), value = details.applianceId, De().setTag("applianceId", value));
      });
    }, new ((n = void 0) || (n = Promise))(function (i, o) {
      function r(e) {
        try {
          u(s.next(e));
        } catch (e) {
          o(e);
        }
      }
      function a(e) {
        try {
          u(s.throw(e));
        } catch (e) {
          o(e);
        }
      }
      function u(e) {
        var t;
        e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n(function (e) {
          e(t);
        })).then(r, a);
      }
      u((s = s.apply(e, t || [])).next());
    });
  }(), State.prototype = {
    accepts: function () {
      return !!this.t;
    },
    tt: function (input, tokenOrState) {
      if (tokenOrState && tokenOrState.j) return this.j[input] = tokenOrState, tokenOrState;
      var token = tokenOrState,
        nextState = this.j[input];
      if (nextState) return token && (nextState.t = token), nextState;
      nextState = makeState();
      var templateState = takeT(this, input);
      return templateState ? (Object.assign(nextState.j, templateState.j), nextState.jr.append(templateState.jr), nextState.jr = templateState.jd, nextState.t = token || templateState.t) : nextState.t = token, this.j[input] = nextState, nextState;
    }
  };
  var makeState = function () {
      return new State();
    },
    makeAcceptingState = function (token) {
      return new State(token);
    },
    makeT = function (startState, input, nextState) {
      startState.j[input] || (startState.j[input] = nextState);
    },
    makeRegexT = function (startState, regex, nextState) {
      startState.jr.push([regex, nextState]);
    },
    takeT = function (state, input) {
      var nextState = state.j[input];
      if (nextState) return nextState;
      for (var i2 = 0; i2 < state.jr.length; i2++) {
        var regex = state.jr[i2][0],
          _nextState = state.jr[i2][1];
        if (regex.test(input)) return _nextState;
      }
      return state.jd;
    },
    makeMultiT = function (startState, chars, nextState) {
      for (var i = 0; i < chars.length; i++) makeT(startState, chars[i], nextState);
    },
    makeChainT = function (state, str, endState, defaultStateFactory) {
      for (var nextState, i = 0, len = str.length; i < len && (nextState = state.j[str[i]]);) state = nextState, i++;
      if (i >= len) return [];
      for (; i < len - 1;) nextState = defaultStateFactory(), makeT(state, str[i], nextState), state = nextState, i++;
      makeT(state, str[len - 1], endState);
    },
    DOMAIN = "DOMAIN",
    LOCALHOST = "LOCALHOST",
    TLD = "TLD",
    NUM = "NUM",
    PROTOCOL = "PROTOCOL",
    MAILTO = "MAILTO",
    NL = "NL",
    OPENBRACE = "OPENBRACE",
    OPENBRACKET = "OPENBRACKET",
    OPENANGLEBRACKET = "OPENANGLEBRACKET",
    OPENPAREN = "OPENPAREN",
    CLOSEBRACE = "CLOSEBRACE",
    CLOSEBRACKET = "CLOSEBRACKET",
    CLOSEANGLEBRACKET = "CLOSEANGLEBRACKET",
    CLOSEPAREN = "CLOSEPAREN",
    AMPERSAND = "AMPERSAND",
    APOSTROPHE = "APOSTROPHE",
    ASTERISK = "ASTERISK",
    AT = "AT",
    BACKSLASH = "BACKSLASH",
    BACKTICK = "BACKTICK",
    CARET = "CARET",
    COLON = "COLON",
    COMMA = "COMMA",
    DOLLAR = "DOLLAR",
    DOT = "DOT",
    EQUALS = "EQUALS",
    EXCLAMATION = "EXCLAMATION",
    HYPHEN = "HYPHEN",
    PERCENT = "PERCENT",
    PIPE = "PIPE",
    PLUS = "PLUS",
    POUND = "POUND",
    QUERY = "QUERY",
    QUOTE = "QUOTE",
    SEMI = "SEMI",
    SLASH = "SLASH",
    TILDE = "TILDE",
    UNDERSCORE = "UNDERSCORE",
    SYM = "SYM",
    Oi = Object.freeze({
      __proto__: null,
      DOMAIN: DOMAIN,
      LOCALHOST: LOCALHOST,
      TLD: TLD,
      NUM: NUM,
      PROTOCOL: PROTOCOL,
      MAILTO: MAILTO,
      WS: "WS",
      NL: NL,
      OPENBRACE: OPENBRACE,
      OPENBRACKET: OPENBRACKET,
      OPENANGLEBRACKET: OPENANGLEBRACKET,
      OPENPAREN: OPENPAREN,
      CLOSEBRACE: CLOSEBRACE,
      CLOSEBRACKET: CLOSEBRACKET,
      CLOSEANGLEBRACKET: CLOSEANGLEBRACKET,
      CLOSEPAREN: CLOSEPAREN,
      AMPERSAND: AMPERSAND,
      APOSTROPHE: APOSTROPHE,
      ASTERISK: ASTERISK,
      AT: AT,
      BACKSLASH: BACKSLASH,
      BACKTICK: BACKTICK,
      CARET: CARET,
      COLON: COLON,
      COMMA: COMMA,
      DOLLAR: DOLLAR,
      DOT: DOT,
      EQUALS: EQUALS,
      EXCLAMATION: EXCLAMATION,
      HYPHEN: HYPHEN,
      PERCENT: PERCENT,
      PIPE: PIPE,
      PLUS: PLUS,
      POUND: POUND,
      QUERY: QUERY,
      QUOTE: QUOTE,
      SEMI: SEMI,
      SLASH: SLASH,
      TILDE: TILDE,
      UNDERSCORE: UNDERSCORE,
      SYM: SYM
    }),
    tlds = "aaa aarp abarth abb abbott abbvie abc able abogado abudhabi ac academy accenture accountant accountants aco actor ad adac ads adult ae aeg aero aetna af afamilycompany afl africa ag agakhan agency ai aig airbus airforce airtel akdn al alfaromeo alibaba alipay allfinanz allstate ally alsace alstom am amazon americanexpress americanfamily amex amfam amica amsterdam analytics android anquan anz ao aol apartments app apple aq aquarelle ar arab aramco archi army arpa art arte as asda asia associates at athleta attorney au auction audi audible audio auspost author auto autos avianca aw aws ax axa az azure ba baby baidu banamex bananarepublic band bank bar barcelona barclaycard barclays barefoot bargains baseball basketball bauhaus bayern bb bbc bbt bbva bcg bcn bd be beats beauty beer bentley berlin best bestbuy bet bf bg bh bharti bi bible bid bike bing bingo bio biz bj black blackfriday blockbuster blog bloomberg blue bm bms bmw bn bnpparibas bo boats boehringer bofa bom bond boo book booking bosch bostik boston bot boutique box br bradesco bridgestone broadway broker brother brussels bs bt budapest bugatti build builders business buy buzz bv bw by bz bzh ca cab cafe cal call calvinklein cam camera camp cancerresearch canon capetown capital capitalone car caravan cards care career careers cars casa case cash casino cat catering catholic cba cbn cbre cbs cc cd center ceo cern cf cfa cfd cg ch chanel channel charity chase chat cheap chintai christmas chrome church ci cipriani circle cisco citadel citi citic city cityeats ck cl claims cleaning click clinic clinique clothing cloud club clubmed cm cn co coach codes coffee college cologne com comcast commbank community company compare computer comsec condos construction consulting contact contractors cooking cookingchannel cool coop corsica country coupon coupons courses cpa cr credit creditcard creditunion cricket crown crs cruise cruises csc cu cuisinella cv cw cx cy cymru cyou cz dabur dad dance data date dating datsun day dclk dds de deal dealer deals degree delivery dell deloitte delta democrat dental dentist desi design dev dhl diamonds diet digital direct directory discount discover dish diy dj dk dm dnp do docs doctor dog domains dot download drive dtv dubai duck dunlop dupont durban dvag dvr dz earth eat ec eco edeka edu education ee eg email emerck energy engineer engineering enterprises epson equipment er ericsson erni es esq estate et etisalat eu eurovision eus events exchange expert exposed express extraspace fage fail fairwinds faith family fan fans farm farmers fashion fast fedex feedback ferrari ferrero fi fiat fidelity fido film final finance financial fire firestone firmdale fish fishing fit fitness fj fk flickr flights flir florist flowers fly fm fo foo food foodnetwork football ford forex forsale forum foundation fox fr free fresenius frl frogans frontdoor frontier ftr fujitsu fujixerox fun fund furniture futbol fyi ga gal gallery gallo gallup game games gap garden gay gb gbiz gd gdn ge gea gent genting george gf gg ggee gh gi gift gifts gives giving gl glade glass gle global globo gm gmail gmbh gmo gmx gn godaddy gold goldpoint golf goo goodyear goog google gop got gov gp gq gr grainger graphics gratis green gripe grocery group gs gt gu guardian gucci guge guide guitars guru gw gy hair hamburg hangout haus hbo hdfc hdfcbank health healthcare help helsinki here hermes hgtv hiphop hisamitsu hitachi hiv hk hkt hm hn hockey holdings holiday homedepot homegoods homes homesense honda horse hospital host hosting hot hoteles hotels hotmail house how hr hsbc ht hu hughes hyatt hyundai ibm icbc ice icu id ie ieee ifm ikano il im imamat imdb immo immobilien in inc industries infiniti info ing ink institute insurance insure int international intuit investments io ipiranga iq ir irish is ismaili ist istanbul it itau itv iveco jaguar java jcb je jeep jetzt jewelry jio jll jm jmp jnj jo jobs joburg jot joy jp jpmorgan jprs juegos juniper kaufen kddi ke kerryhotels kerrylogistics kerryproperties kfh kg kh ki kia kim kinder kindle kitchen kiwi km kn koeln komatsu kosher kp kpmg kpn kr krd kred kuokgroup kw ky kyoto kz la lacaixa lamborghini lamer lancaster lancia land landrover lanxess lasalle lat latino latrobe law lawyer lb lc lds lease leclerc lefrak legal lego lexus lgbt li lidl life lifeinsurance lifestyle lighting like lilly limited limo lincoln linde link lipsy live living lixil lk llc llp loan loans locker locus loft lol london lotte lotto love lpl lplfinancial lr ls lt ltd ltda lu lundbeck luxe luxury lv ly ma macys madrid maif maison makeup man management mango map market marketing markets marriott marshalls maserati mattel mba mc mckinsey md me med media meet melbourne meme memorial men menu merckmsd mg mh miami microsoft mil mini mint mit mitsubishi mk ml mlb mls mm mma mn mo mobi mobile moda moe moi mom monash money monster mormon mortgage moscow moto motorcycles mov movie mp mq mr ms msd mt mtn mtr mu museum mutual mv mw mx my mz na nab nagoya name nationwide natura navy nba nc ne nec net netbank netflix network neustar new news next nextdirect nexus nf nfl ng ngo nhk ni nico nike nikon ninja nissan nissay nl no nokia northwesternmutual norton now nowruz nowtv np nr nra nrw ntt nu nyc nz obi observer off office okinawa olayan olayangroup oldnavy ollo om omega one ong onl online onyourside ooo open oracle orange org organic origins osaka otsuka ott ovh pa page panasonic paris pars partners parts party passagens pay pccw pe pet pf pfizer pg ph pharmacy phd philips phone photo photography photos physio pics pictet pictures pid pin ping pink pioneer pizza pk pl place play playstation plumbing plus pm pn pnc pohl poker politie porn post pr pramerica praxi press prime pro prod productions prof progressive promo properties property protection pru prudential ps pt pub pw pwc py qa qpon quebec quest qvc racing radio raid re read realestate realtor realty recipes red redstone redumbrella rehab reise reisen reit reliance ren rent rentals repair report republican rest restaurant review reviews rexroth rich richardli ricoh ril rio rip rmit ro rocher rocks rodeo rogers room rs rsvp ru rugby ruhr run rw rwe ryukyu sa saarland safe safety sakura sale salon samsclub samsung sandvik sandvikcoromant sanofi sap sarl sas save saxo sb sbi sbs sc sca scb schaeffler schmidt scholarships school schule schwarz science scjohnson scot sd se search seat secure security seek select sener services ses seven sew sex sexy sfr sg sh shangrila sharp shaw shell shia shiksha shoes shop shopping shouji show showtime si silk sina singles site sj sk ski skin sky skype sl sling sm smart smile sn sncf so soccer social softbank software sohu solar solutions song sony soy spa space sport spot spreadbetting sr srl ss st stada staples star statebank statefarm stc stcgroup stockholm storage store stream studio study style su sucks supplies supply support surf surgery suzuki sv swatch swiftcover swiss sx sy sydney systems sz tab taipei talk taobao target tatamotors tatar tattoo tax taxi tc tci td tdk team tech technology tel temasek tennis teva tf tg th thd theater theatre tiaa tickets tienda tiffany tips tires tirol tj tjmaxx tjx tk tkmaxx tl tm tmall tn to today tokyo tools top toray toshiba total tours town toyota toys tr trade trading training travel travelchannel travelers travelersinsurance trust trv tt tube tui tunes tushu tv tvs tw tz ua ubank ubs ug uk unicom university uno uol ups us uy uz va vacations vana vanguard vc ve vegas ventures verisign versicherung vet vg vi viajes video vig viking villas vin vip virgin visa vision viva vivo vlaanderen vn vodka volkswagen volvo vote voting voto voyage vu vuelos wales walmart walter wang wanggou watch watches weather weatherchannel webcam weber website wed wedding weibo weir wf whoswho wien wiki williamhill win windows wine winners wme wolterskluwer woodside work works world wow ws wtc wtf xbox xerox xfinity xihuan xin xxx xyz yachts yahoo yamaxun yandex ye yodobashi yoga yokohama you youtube yt yun za zappos zara zero zip zm zone zuerich zw vermögensberater-ctb vermögensberatung-pwb ελ ευ бг бел дети ею католик ком қаз мкд мон москва онлайн орг рус рф сайт срб укр გე հայ ישראל קום ابوظبي اتصالات ارامكو الاردن البحرين الجزائر السعودية العليان المغرب امارات ایران بارت بازار بھارت بيتك پاکستان ڀارت تونس سودان سورية شبكة عراق عرب عمان فلسطين قطر كاثوليك كوم مصر مليسيا موريتانيا موقع همراه कॉम नेट भारत भारतम् भारोत संगठन বাংলা ভারত ভাৰত ਭਾਰਤ ભારત ଭାରତ இந்தியா இலங்கை சிங்கப்பூர் భారత్ ಭಾರತ ഭാരതം ලංකා คอม ไทย ລາວ 닷넷 닷컴 삼성 한국 アマゾン グーグル クラウド コム ストア セール ファッション ポイント みんな 世界 中信 中国 中國 中文网 亚马逊 企业 佛山 信息 健康 八卦 公司 公益 台湾 台灣 商城 商店 商标 嘉里 嘉里大酒店 在线 大众汽车 大拿 天主教 娱乐 家電 广东 微博 慈善 我爱你 手机 招聘 政务 政府 新加坡 新闻 时尚 書籍 机构 淡马锡 游戏 澳門 点看 移动 组织机构 网址 网店 网站 网络 联通 诺基亚 谷歌 购物 通販 集团 電訊盈科 飞利浦 食品 餐厅 香格里拉 香港".split(" "),
    LETTER = /(?:[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF38\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])/,
    EMOJI = /(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEDD-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDDFF\uDE70-\uDE74\uDE78-\uDE7C\uDE80-\uDE86\uDE90-\uDEAC\uDEB0-\uDEBA\uDEC0-\uDEC5\uDED0-\uDED9\uDEE0-\uDEE7\uDEF0-\uDEF6])/,
    EMOJI_VARIATION = /\uFE0F/,
    DIGIT = /\d/,
    SPACE = /\s/;
  function init$2() {
    var customProtocols = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [],
      S_START = makeState(),
      S_NUM = makeAcceptingState(NUM),
      S_DOMAIN = makeAcceptingState(DOMAIN),
      S_DOMAIN_HYPHEN = makeState(),
      S_WS = makeAcceptingState("WS"),
      DOMAIN_REGEX_TRANSITIONS = [[DIGIT, S_DOMAIN], [LETTER, S_DOMAIN], [EMOJI, S_DOMAIN], [EMOJI_VARIATION, S_DOMAIN]],
      makeDomainState = function () {
        var state = makeAcceptingState(DOMAIN);
        return state.j = {
          "-": S_DOMAIN_HYPHEN
        }, state.jr = [].concat(DOMAIN_REGEX_TRANSITIONS), state;
      },
      makeNearDomainState = function (token) {
        var state = makeDomainState();
        return state.t = token, state;
      };
    !function (startState, transitions) {
      for (var i2 = 0; i2 < transitions.length; i2++) {
        var input = transitions[i2][0],
          nextState = transitions[i2][1];
        makeT(startState, input, nextState);
      }
    }(S_START, [["'", makeAcceptingState(APOSTROPHE)], ["{", makeAcceptingState(OPENBRACE)], ["[", makeAcceptingState(OPENBRACKET)], ["<", makeAcceptingState(OPENANGLEBRACKET)], ["(", makeAcceptingState(OPENPAREN)], ["}", makeAcceptingState(CLOSEBRACE)], ["]", makeAcceptingState(CLOSEBRACKET)], [">", makeAcceptingState(CLOSEANGLEBRACKET)], [")", makeAcceptingState(CLOSEPAREN)], ["&", makeAcceptingState(AMPERSAND)], ["*", makeAcceptingState(ASTERISK)], ["@", makeAcceptingState(AT)], ["`", makeAcceptingState(BACKTICK)], ["^", makeAcceptingState(CARET)], [":", makeAcceptingState(COLON)], [",", makeAcceptingState(COMMA)], ["$", makeAcceptingState(DOLLAR)], [".", makeAcceptingState(DOT)], ["=", makeAcceptingState(EQUALS)], ["!", makeAcceptingState(EXCLAMATION)], ["-", makeAcceptingState(HYPHEN)], ["%", makeAcceptingState(PERCENT)], ["|", makeAcceptingState(PIPE)], ["+", makeAcceptingState(PLUS)], ["#", makeAcceptingState(POUND)], ["?", makeAcceptingState(QUERY)], ['"', makeAcceptingState(QUOTE)], ["/", makeAcceptingState(SLASH)], [";", makeAcceptingState(SEMI)], ["~", makeAcceptingState(TILDE)], ["_", makeAcceptingState(UNDERSCORE)], ["\\", makeAcceptingState(BACKSLASH)]]), makeT(S_START, "\n", makeAcceptingState(NL)), makeRegexT(S_START, SPACE, S_WS), makeT(S_WS, "\n", makeState()), makeRegexT(S_WS, SPACE, S_WS);
    for (var i = 0; i < tlds.length; i++) makeChainT(S_START, tlds[i], makeNearDomainState(TLD), makeDomainState);
    var S_PROTOCOL_FILE = makeDomainState(),
      S_PROTOCOL_FTP = makeDomainState(),
      S_PROTOCOL_HTTP = makeDomainState(),
      S_MAILTO = makeDomainState();
    makeChainT(S_START, "file", S_PROTOCOL_FILE, makeDomainState), makeChainT(S_START, "ftp", S_PROTOCOL_FTP, makeDomainState), makeChainT(S_START, "http", S_PROTOCOL_HTTP, makeDomainState), makeChainT(S_START, "mailto", S_MAILTO, makeDomainState);
    var S_PROTOCOL_SECURE = makeDomainState(),
      S_FULL_PROTOCOL = makeAcceptingState(PROTOCOL),
      S_FULL_MAILTO = makeAcceptingState(MAILTO);
    makeT(S_PROTOCOL_FTP, "s", S_PROTOCOL_SECURE), makeT(S_PROTOCOL_FTP, ":", S_FULL_PROTOCOL), makeT(S_PROTOCOL_HTTP, "s", S_PROTOCOL_SECURE), makeT(S_PROTOCOL_HTTP, ":", S_FULL_PROTOCOL), makeT(S_PROTOCOL_FILE, ":", S_FULL_PROTOCOL), makeT(S_PROTOCOL_SECURE, ":", S_FULL_PROTOCOL), makeT(S_MAILTO, ":", S_FULL_MAILTO);
    for (var S_CUSTOM_PROTOCOL = makeDomainState(), _i = 0; _i < customProtocols.length; _i++) makeChainT(S_START, customProtocols[_i], S_CUSTOM_PROTOCOL, makeDomainState);
    return makeT(S_CUSTOM_PROTOCOL, ":", S_FULL_PROTOCOL), makeChainT(S_START, "localhost", makeNearDomainState(LOCALHOST), makeDomainState), makeRegexT(S_START, DIGIT, S_NUM), makeRegexT(S_START, LETTER, S_DOMAIN), makeRegexT(S_START, EMOJI, S_DOMAIN), makeRegexT(S_START, EMOJI_VARIATION, S_DOMAIN), makeRegexT(S_NUM, DIGIT, S_NUM), makeRegexT(S_NUM, LETTER, S_DOMAIN), makeRegexT(S_NUM, EMOJI, S_DOMAIN), makeRegexT(S_NUM, EMOJI_VARIATION, S_DOMAIN), makeT(S_NUM, "-", S_DOMAIN_HYPHEN), makeT(S_DOMAIN, "-", S_DOMAIN_HYPHEN), makeT(S_DOMAIN_HYPHEN, "-", S_DOMAIN_HYPHEN), makeRegexT(S_DOMAIN, DIGIT, S_DOMAIN), makeRegexT(S_DOMAIN, LETTER, S_DOMAIN), makeRegexT(S_DOMAIN, EMOJI, S_DOMAIN), makeRegexT(S_DOMAIN, EMOJI_VARIATION, S_DOMAIN), makeRegexT(S_DOMAIN_HYPHEN, DIGIT, S_DOMAIN), makeRegexT(S_DOMAIN_HYPHEN, LETTER, S_DOMAIN), makeRegexT(S_DOMAIN_HYPHEN, EMOJI, S_DOMAIN), makeRegexT(S_DOMAIN_HYPHEN, EMOJI_VARIATION, S_DOMAIN), S_START.jd = makeAcceptingState(SYM), S_START;
  }
  function _typeof(obj) {
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  var defaults = {
    defaultProtocol: "http",
    events: null,
    format: noop,
    formatHref: noop,
    nl2br: !1,
    tagName: "a",
    target: null,
    rel: null,
    validate: !0,
    truncate: 0,
    className: null,
    attributes: null,
    ignoreTags: []
  };
  function Options(opts) {
    opts = opts || {}, this.defaultProtocol = "defaultProtocol" in opts ? opts.defaultProtocol : defaults.defaultProtocol, this.events = "events" in opts ? opts.events : defaults.events, this.format = "format" in opts ? opts.format : defaults.format, this.formatHref = "formatHref" in opts ? opts.formatHref : defaults.formatHref, this.nl2br = "nl2br" in opts ? opts.nl2br : defaults.nl2br, this.tagName = "tagName" in opts ? opts.tagName : defaults.tagName, this.target = "target" in opts ? opts.target : defaults.target, this.rel = "rel" in opts ? opts.rel : defaults.rel, this.validate = "validate" in opts ? opts.validate : defaults.validate, this.truncate = "truncate" in opts ? opts.truncate : defaults.truncate, this.className = "className" in opts ? opts.className : defaults.className, this.attributes = opts.attributes || defaults.attributes, this.ignoreTags = [];
    for (var ignoredTags = ("ignoreTags" in opts) ? opts.ignoreTags : defaults.ignoreTags, i = 0; i < ignoredTags.length; i++) this.ignoreTags.push(ignoredTags[i].toUpperCase());
  }
  function noop(val) {
    return val;
  }
  function MultiToken() {}
  function createTokenClass(type, props) {
    function Token(value, tokens) {
      this.t = type, this.v = value, this.tk = tokens;
    }
    return function (parent, child) {
      var props = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
        extended = Object.create(parent.prototype);
      for (var p in props) extended[p] = props[p];
      extended.constructor = child, child.prototype = extended;
    }(MultiToken, Token, props), Token;
  }
  Options.prototype = {
    resolve: function (token) {
      var href = token.toHref(this.defaultProtocol);
      return {
        formatted: this.get("format", token.toString(), token),
        formattedHref: this.get("formatHref", href, token),
        tagName: this.get("tagName", href, token),
        className: this.get("className", href, token),
        target: this.get("target", href, token),
        rel: this.get("rel", href, token),
        events: this.getObject("events", href, token),
        attributes: this.getObject("attributes", href, token),
        truncate: this.get("truncate", href, token)
      };
    },
    check: function (token) {
      return this.get("validate", token.toString(), token);
    },
    get: function (key, operator, token) {
      var optionValue,
        option = this[key];
      if (!option) return option;
      switch (_typeof(option)) {
        case "function":
          return option(operator, token.t);
        case "object":
          return "function" == typeof (optionValue = token.t in option ? option[token.t] : defaults[key]) ? optionValue(operator, token.t) : optionValue;
      }
      return option;
    },
    getObject: function (key, operator, token) {
      var option = this[key];
      return "function" == typeof option ? option(operator, token.t) : option;
    }
  }, MultiToken.prototype = {
    t: "token",
    isLink: !1,
    toString: function () {
      return this.v;
    },
    toHref: function () {
      return this.toString();
    },
    startIndex: function () {
      return this.tk[0].s;
    },
    endIndex: function () {
      return this.tk[this.tk.length - 1].e;
    },
    toObject: function () {
      var protocol = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : defaults.defaultProtocol;
      return {
        type: this.t,
        value: this.v,
        isLink: this.isLink,
        href: this.toHref(protocol),
        start: this.startIndex(),
        end: this.endIndex()
      };
    }
  };
  var MailtoEmail = createTokenClass("email", {
      isLink: !0
    }),
    Email = createTokenClass("email", {
      isLink: !0,
      toHref: function () {
        return "mailto:" + this.toString();
      }
    }),
    Text = createTokenClass("text"),
    Nl = createTokenClass("nl"),
    Url = createTokenClass("url", {
      isLink: !0,
      toHref: function () {
        for (var protocol = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : defaults.defaultProtocol, tokens = this.tk, hasProtocol = !1, hasSlashSlash = !1, result = [], i = 0; tokens[i].t === PROTOCOL;) hasProtocol = !0, result.push(tokens[i].v), i++;
        for (; tokens[i].t === SLASH;) hasSlashSlash = !0, result.push(tokens[i].v), i++;
        for (; i < tokens.length; i++) result.push(tokens[i].v);
        return result = result.join(""), hasProtocol || hasSlashSlash || (result = "".concat(protocol, "://").concat(result)), result;
      },
      hasProtocol: function () {
        return this.tk[0].t === PROTOCOL;
      }
    }),
    multi = Object.freeze({
      __proto__: null,
      MultiToken: MultiToken,
      Base: MultiToken,
      createTokenClass: createTokenClass,
      MailtoEmail: MailtoEmail,
      Email: Email,
      Text: Text,
      Nl: Nl,
      Url: Url
    });
  function init$1() {
    var S_START = makeState(),
      S_PROTOCOL = makeState(),
      S_MAILTO = makeState(),
      S_PROTOCOL_SLASH = makeState(),
      S_PROTOCOL_SLASH_SLASH = makeState(),
      S_DOMAIN = makeState(),
      S_DOMAIN_DOT = makeState(),
      S_TLD = makeAcceptingState(Url),
      S_TLD_COLON = makeState(),
      S_TLD_PORT = makeAcceptingState(Url),
      S_URL = makeAcceptingState(Url),
      S_URL_NON_ACCEPTING = makeState(),
      S_URL_OPENBRACE = makeState(),
      S_URL_OPENBRACKET = makeState(),
      S_URL_OPENANGLEBRACKET = makeState(),
      S_URL_OPENPAREN = makeState(),
      S_URL_OPENBRACE_Q = makeAcceptingState(Url),
      S_URL_OPENBRACKET_Q = makeAcceptingState(Url),
      S_URL_OPENANGLEBRACKET_Q = makeAcceptingState(Url),
      S_URL_OPENPAREN_Q = makeAcceptingState(Url),
      S_URL_OPENBRACE_SYMS = makeState(),
      S_URL_OPENBRACKET_SYMS = makeState(),
      S_URL_OPENANGLEBRACKET_SYMS = makeState(),
      S_URL_OPENPAREN_SYMS = makeState(),
      S_EMAIL_DOMAIN = makeState(),
      S_EMAIL_DOMAIN_DOT = makeState(),
      S_EMAIL = makeAcceptingState(Email),
      S_EMAIL_COLON = makeState(),
      S_EMAIL_PORT = makeAcceptingState(Email),
      S_MAILTO_EMAIL = makeAcceptingState(MailtoEmail),
      S_MAILTO_EMAIL_NON_ACCEPTING = makeState(),
      S_LOCALPART = makeState(),
      S_LOCALPART_AT = makeState(),
      S_LOCALPART_DOT = makeState(),
      S_NL = makeAcceptingState(Nl);
    makeT(S_START, NL, S_NL), makeT(S_START, PROTOCOL, S_PROTOCOL), makeT(S_START, MAILTO, S_MAILTO), makeT(S_PROTOCOL, SLASH, S_PROTOCOL_SLASH), makeT(S_PROTOCOL_SLASH, SLASH, S_PROTOCOL_SLASH_SLASH), makeT(S_START, TLD, S_DOMAIN), makeT(S_START, DOMAIN, S_DOMAIN), makeT(S_START, LOCALHOST, S_TLD), makeT(S_START, NUM, S_DOMAIN), makeT(S_PROTOCOL_SLASH_SLASH, TLD, S_URL), makeT(S_PROTOCOL_SLASH_SLASH, DOMAIN, S_URL), makeT(S_PROTOCOL_SLASH_SLASH, NUM, S_URL), makeT(S_PROTOCOL_SLASH_SLASH, LOCALHOST, S_URL), makeT(S_DOMAIN, DOT, S_DOMAIN_DOT), makeT(S_EMAIL_DOMAIN, DOT, S_EMAIL_DOMAIN_DOT), makeT(S_DOMAIN_DOT, TLD, S_TLD), makeT(S_DOMAIN_DOT, DOMAIN, S_DOMAIN), makeT(S_DOMAIN_DOT, NUM, S_DOMAIN), makeT(S_DOMAIN_DOT, LOCALHOST, S_DOMAIN), makeT(S_EMAIL_DOMAIN_DOT, TLD, S_EMAIL), makeT(S_EMAIL_DOMAIN_DOT, DOMAIN, S_EMAIL_DOMAIN), makeT(S_EMAIL_DOMAIN_DOT, NUM, S_EMAIL_DOMAIN), makeT(S_EMAIL_DOMAIN_DOT, LOCALHOST, S_EMAIL_DOMAIN), makeT(S_TLD, DOT, S_DOMAIN_DOT), makeT(S_EMAIL, DOT, S_EMAIL_DOMAIN_DOT), makeT(S_TLD, COLON, S_TLD_COLON), makeT(S_TLD, SLASH, S_URL), makeT(S_TLD_COLON, NUM, S_TLD_PORT), makeT(S_TLD_PORT, SLASH, S_URL), makeT(S_EMAIL, COLON, S_EMAIL_COLON), makeT(S_EMAIL_COLON, NUM, S_EMAIL_PORT);
    var qsAccepting = [AMPERSAND, ASTERISK, AT, BACKSLASH, BACKTICK, CARET, DOLLAR, DOMAIN, EQUALS, HYPHEN, LOCALHOST, NUM, PERCENT, PIPE, PLUS, POUND, PROTOCOL, SLASH, SYM, TILDE, TLD, UNDERSCORE],
      qsNonAccepting = [APOSTROPHE, CLOSEANGLEBRACKET, CLOSEBRACE, CLOSEBRACKET, CLOSEPAREN, COLON, COMMA, DOT, EXCLAMATION, OPENANGLEBRACKET, OPENBRACE, OPENBRACKET, OPENPAREN, QUERY, QUOTE, SEMI];
    makeT(S_URL, OPENBRACE, S_URL_OPENBRACE), makeT(S_URL, OPENBRACKET, S_URL_OPENBRACKET), makeT(S_URL, OPENANGLEBRACKET, S_URL_OPENANGLEBRACKET), makeT(S_URL, OPENPAREN, S_URL_OPENPAREN), makeT(S_URL_NON_ACCEPTING, OPENBRACE, S_URL_OPENBRACE), makeT(S_URL_NON_ACCEPTING, OPENBRACKET, S_URL_OPENBRACKET), makeT(S_URL_NON_ACCEPTING, OPENANGLEBRACKET, S_URL_OPENANGLEBRACKET), makeT(S_URL_NON_ACCEPTING, OPENPAREN, S_URL_OPENPAREN), makeT(S_URL_OPENBRACE, CLOSEBRACE, S_URL), makeT(S_URL_OPENBRACKET, CLOSEBRACKET, S_URL), makeT(S_URL_OPENANGLEBRACKET, CLOSEANGLEBRACKET, S_URL), makeT(S_URL_OPENPAREN, CLOSEPAREN, S_URL), makeT(S_URL_OPENBRACE_Q, CLOSEBRACE, S_URL), makeT(S_URL_OPENBRACKET_Q, CLOSEBRACKET, S_URL), makeT(S_URL_OPENANGLEBRACKET_Q, CLOSEANGLEBRACKET, S_URL), makeT(S_URL_OPENPAREN_Q, CLOSEPAREN, S_URL), makeT(S_URL_OPENBRACE_SYMS, CLOSEBRACE, S_URL), makeT(S_URL_OPENBRACKET_SYMS, CLOSEBRACKET, S_URL), makeT(S_URL_OPENANGLEBRACKET_SYMS, CLOSEANGLEBRACKET, S_URL), makeT(S_URL_OPENPAREN_SYMS, CLOSEPAREN, S_URL), makeMultiT(S_URL_OPENBRACE, qsAccepting, S_URL_OPENBRACE_Q), makeMultiT(S_URL_OPENBRACKET, qsAccepting, S_URL_OPENBRACKET_Q), makeMultiT(S_URL_OPENANGLEBRACKET, qsAccepting, S_URL_OPENANGLEBRACKET_Q), makeMultiT(S_URL_OPENPAREN, qsAccepting, S_URL_OPENPAREN_Q), makeMultiT(S_URL_OPENBRACE, qsNonAccepting, S_URL_OPENBRACE_SYMS), makeMultiT(S_URL_OPENBRACKET, qsNonAccepting, S_URL_OPENBRACKET_SYMS), makeMultiT(S_URL_OPENANGLEBRACKET, qsNonAccepting, S_URL_OPENANGLEBRACKET_SYMS), makeMultiT(S_URL_OPENPAREN, qsNonAccepting, S_URL_OPENPAREN_SYMS), makeMultiT(S_URL_OPENBRACE_Q, qsAccepting, S_URL_OPENBRACE_Q), makeMultiT(S_URL_OPENBRACKET_Q, qsAccepting, S_URL_OPENBRACKET_Q), makeMultiT(S_URL_OPENANGLEBRACKET_Q, qsAccepting, S_URL_OPENANGLEBRACKET_Q), makeMultiT(S_URL_OPENPAREN_Q, qsAccepting, S_URL_OPENPAREN_Q), makeMultiT(S_URL_OPENBRACE_Q, qsNonAccepting, S_URL_OPENBRACE_Q), makeMultiT(S_URL_OPENBRACKET_Q, qsNonAccepting, S_URL_OPENBRACKET_Q), makeMultiT(S_URL_OPENANGLEBRACKET_Q, qsNonAccepting, S_URL_OPENANGLEBRACKET_Q), makeMultiT(S_URL_OPENPAREN_Q, qsNonAccepting, S_URL_OPENPAREN_Q), makeMultiT(S_URL_OPENBRACE_SYMS, qsAccepting, S_URL_OPENBRACE_Q), makeMultiT(S_URL_OPENBRACKET_SYMS, qsAccepting, S_URL_OPENBRACKET_Q), makeMultiT(S_URL_OPENANGLEBRACKET_SYMS, qsAccepting, S_URL_OPENANGLEBRACKET_Q), makeMultiT(S_URL_OPENPAREN_SYMS, qsAccepting, S_URL_OPENPAREN_Q), makeMultiT(S_URL_OPENBRACE_SYMS, qsNonAccepting, S_URL_OPENBRACE_SYMS), makeMultiT(S_URL_OPENBRACKET_SYMS, qsNonAccepting, S_URL_OPENBRACKET_SYMS), makeMultiT(S_URL_OPENANGLEBRACKET_SYMS, qsNonAccepting, S_URL_OPENANGLEBRACKET_SYMS), makeMultiT(S_URL_OPENPAREN_SYMS, qsNonAccepting, S_URL_OPENPAREN_SYMS), makeMultiT(S_URL, qsAccepting, S_URL), makeMultiT(S_URL_NON_ACCEPTING, qsAccepting, S_URL), makeMultiT(S_URL, qsNonAccepting, S_URL_NON_ACCEPTING), makeMultiT(S_URL_NON_ACCEPTING, qsNonAccepting, S_URL_NON_ACCEPTING), makeT(S_MAILTO, TLD, S_MAILTO_EMAIL), makeT(S_MAILTO, DOMAIN, S_MAILTO_EMAIL), makeT(S_MAILTO, NUM, S_MAILTO_EMAIL), makeT(S_MAILTO, LOCALHOST, S_MAILTO_EMAIL), makeMultiT(S_MAILTO_EMAIL, qsAccepting, S_MAILTO_EMAIL), makeMultiT(S_MAILTO_EMAIL, qsNonAccepting, S_MAILTO_EMAIL_NON_ACCEPTING), makeMultiT(S_MAILTO_EMAIL_NON_ACCEPTING, qsAccepting, S_MAILTO_EMAIL), makeMultiT(S_MAILTO_EMAIL_NON_ACCEPTING, qsNonAccepting, S_MAILTO_EMAIL_NON_ACCEPTING);
    var localpartAccepting = [AMPERSAND, APOSTROPHE, ASTERISK, BACKSLASH, BACKTICK, CARET, CLOSEBRACE, DOLLAR, DOMAIN, EQUALS, HYPHEN, NUM, OPENBRACE, PERCENT, PIPE, PLUS, POUND, QUERY, SLASH, SYM, TILDE, TLD, UNDERSCORE];
    return makeMultiT(S_DOMAIN, localpartAccepting, S_LOCALPART), makeT(S_DOMAIN, AT, S_LOCALPART_AT), makeMultiT(S_TLD, localpartAccepting, S_LOCALPART), makeT(S_TLD, AT, S_LOCALPART_AT), makeMultiT(S_DOMAIN_DOT, localpartAccepting, S_LOCALPART), makeMultiT(S_LOCALPART, localpartAccepting, S_LOCALPART), makeT(S_LOCALPART, AT, S_LOCALPART_AT), makeT(S_LOCALPART, DOT, S_LOCALPART_DOT), makeMultiT(S_LOCALPART_DOT, localpartAccepting, S_LOCALPART), makeT(S_LOCALPART_AT, TLD, S_EMAIL_DOMAIN), makeT(S_LOCALPART_AT, DOMAIN, S_EMAIL_DOMAIN), makeT(S_LOCALPART_AT, NUM, S_EMAIL_DOMAIN), makeT(S_LOCALPART_AT, LOCALHOST, S_EMAIL), S_START;
  }
  function parserCreateMultiToken(Multi, input, tokens) {
    var startIdx = tokens[0].s,
      endIdx = tokens[tokens.length - 1].e;
    return new Multi(input.substr(startIdx, endIdx - startIdx), tokens);
  }
  "undefined" != typeof console && console && console.warn;
  var INIT = {
    scanner: null,
    parser: null,
    pluginQueue: [],
    customProtocols: [],
    initialized: !1
  };
  var HTML5NamedCharRefs = {
      nbsp: " "
    },
    HEXCHARCODE = /^#[xX]([A-Fa-f0-9]+)$/,
    CHARCODE = /^#([0-9]+)$/,
    NAMED = /^([A-Za-z0-9]+)$/,
    EntityParser = function () {
      function EntityParser(named) {
        this.named = named;
      }
      return EntityParser.prototype.parse = function (entity) {
        if (entity) {
          var matches = entity.match(HEXCHARCODE);
          return matches ? "&#x" + matches[1] + ";" : (matches = entity.match(CHARCODE)) ? "&#" + matches[1] + ";" : (matches = entity.match(NAMED)) ? this.named[matches[1]] || "&" + matches[1] + ";" : void 0;
        }
      }, EntityParser;
    }(),
    WSP = /[\t\n\f ]/,
    ALPHA = /[A-Za-z]/,
    CRLF = /\r\n?/g;
  function isSpace(char) {
    return WSP.test(char);
  }
  function isAlpha(char) {
    return ALPHA.test(char);
  }
  var EventedTokenizer = function () {
      function EventedTokenizer(delegate, entityParser, mode) {
        void 0 === mode && (mode = "precompile"), this.delegate = delegate, this.entityParser = entityParser, this.mode = mode, this.state = "beforeData", this.line = -1, this.column = -1, this.input = "", this.index = -1, this.tagNameBuffer = "", this.states = {
          beforeData: function () {
            var char = this.peek();
            if ("<" !== char || this.isIgnoredEndTag()) {
              if ("precompile" === this.mode && "\n" === char) {
                var tag = this.tagNameBuffer.toLowerCase();
                "pre" !== tag && "textarea" !== tag || this.consume();
              }
              this.transitionTo("data"), this.delegate.beginData();
            } else this.transitionTo("tagOpen"), this.markTagStart(), this.consume();
          },
          data: function () {
            var char = this.peek(),
              tag = this.tagNameBuffer;
            "<" !== char || this.isIgnoredEndTag() ? "&" === char && "script" !== tag && "style" !== tag ? (this.consume(), this.delegate.appendToData(this.consumeCharRef() || "&")) : (this.consume(), this.delegate.appendToData(char)) : (this.delegate.finishData(), this.transitionTo("tagOpen"), this.markTagStart(), this.consume());
          },
          tagOpen: function () {
            var char = this.consume();
            "!" === char ? this.transitionTo("markupDeclarationOpen") : "/" === char ? this.transitionTo("endTagOpen") : ("@" === char || ":" === char || isAlpha(char)) && (this.transitionTo("tagName"), this.tagNameBuffer = "", this.delegate.beginStartTag(), this.appendToTagName(char));
          },
          markupDeclarationOpen: function () {
            var char = this.consume();
            "-" === char && "-" === this.peek() ? (this.consume(), this.transitionTo("commentStart"), this.delegate.beginComment()) : "DOCTYPE" === char.toUpperCase() + this.input.substring(this.index, this.index + 6).toUpperCase() && (this.consume(), this.consume(), this.consume(), this.consume(), this.consume(), this.consume(), this.transitionTo("doctype"), this.delegate.beginDoctype && this.delegate.beginDoctype());
          },
          doctype: function () {
            isSpace(this.consume()) && this.transitionTo("beforeDoctypeName");
          },
          beforeDoctypeName: function () {
            var char = this.consume();
            isSpace(char) || (this.transitionTo("doctypeName"), this.delegate.appendToDoctypeName && this.delegate.appendToDoctypeName(char.toLowerCase()));
          },
          doctypeName: function () {
            var char = this.consume();
            isSpace(char) ? this.transitionTo("afterDoctypeName") : ">" === char ? (this.delegate.endDoctype && this.delegate.endDoctype(), this.transitionTo("beforeData")) : this.delegate.appendToDoctypeName && this.delegate.appendToDoctypeName(char.toLowerCase());
          },
          afterDoctypeName: function () {
            var char = this.consume();
            if (!isSpace(char)) if (">" === char) this.delegate.endDoctype && this.delegate.endDoctype(), this.transitionTo("beforeData");else {
              var nextSixChars = char.toUpperCase() + this.input.substring(this.index, this.index + 5).toUpperCase(),
                isPublic = "PUBLIC" === nextSixChars.toUpperCase(),
                isSystem = "SYSTEM" === nextSixChars.toUpperCase();
              (isPublic || isSystem) && (this.consume(), this.consume(), this.consume(), this.consume(), this.consume(), this.consume()), isPublic ? this.transitionTo("afterDoctypePublicKeyword") : isSystem && this.transitionTo("afterDoctypeSystemKeyword");
            }
          },
          afterDoctypePublicKeyword: function () {
            var char = this.peek();
            isSpace(char) ? (this.transitionTo("beforeDoctypePublicIdentifier"), this.consume()) : '"' === char ? (this.transitionTo("doctypePublicIdentifierDoubleQuoted"), this.consume()) : "'" === char ? (this.transitionTo("doctypePublicIdentifierSingleQuoted"), this.consume()) : ">" === char && (this.consume(), this.delegate.endDoctype && this.delegate.endDoctype(), this.transitionTo("beforeData"));
          },
          doctypePublicIdentifierDoubleQuoted: function () {
            var char = this.consume();
            '"' === char ? this.transitionTo("afterDoctypePublicIdentifier") : ">" === char ? (this.delegate.endDoctype && this.delegate.endDoctype(), this.transitionTo("beforeData")) : this.delegate.appendToDoctypePublicIdentifier && this.delegate.appendToDoctypePublicIdentifier(char);
          },
          doctypePublicIdentifierSingleQuoted: function () {
            var char = this.consume();
            "'" === char ? this.transitionTo("afterDoctypePublicIdentifier") : ">" === char ? (this.delegate.endDoctype && this.delegate.endDoctype(), this.transitionTo("beforeData")) : this.delegate.appendToDoctypePublicIdentifier && this.delegate.appendToDoctypePublicIdentifier(char);
          },
          afterDoctypePublicIdentifier: function () {
            var char = this.consume();
            isSpace(char) ? this.transitionTo("betweenDoctypePublicAndSystemIdentifiers") : ">" === char ? (this.delegate.endDoctype && this.delegate.endDoctype(), this.transitionTo("beforeData")) : '"' === char ? this.transitionTo("doctypeSystemIdentifierDoubleQuoted") : "'" === char && this.transitionTo("doctypeSystemIdentifierSingleQuoted");
          },
          betweenDoctypePublicAndSystemIdentifiers: function () {
            var char = this.consume();
            isSpace(char) || (">" === char ? (this.delegate.endDoctype && this.delegate.endDoctype(), this.transitionTo("beforeData")) : '"' === char ? this.transitionTo("doctypeSystemIdentifierDoubleQuoted") : "'" === char && this.transitionTo("doctypeSystemIdentifierSingleQuoted"));
          },
          doctypeSystemIdentifierDoubleQuoted: function () {
            var char = this.consume();
            '"' === char ? this.transitionTo("afterDoctypeSystemIdentifier") : ">" === char ? (this.delegate.endDoctype && this.delegate.endDoctype(), this.transitionTo("beforeData")) : this.delegate.appendToDoctypeSystemIdentifier && this.delegate.appendToDoctypeSystemIdentifier(char);
          },
          doctypeSystemIdentifierSingleQuoted: function () {
            var char = this.consume();
            "'" === char ? this.transitionTo("afterDoctypeSystemIdentifier") : ">" === char ? (this.delegate.endDoctype && this.delegate.endDoctype(), this.transitionTo("beforeData")) : this.delegate.appendToDoctypeSystemIdentifier && this.delegate.appendToDoctypeSystemIdentifier(char);
          },
          afterDoctypeSystemIdentifier: function () {
            var char = this.consume();
            isSpace(char) || ">" === char && (this.delegate.endDoctype && this.delegate.endDoctype(), this.transitionTo("beforeData"));
          },
          commentStart: function () {
            var char = this.consume();
            "-" === char ? this.transitionTo("commentStartDash") : ">" === char ? (this.delegate.finishComment(), this.transitionTo("beforeData")) : (this.delegate.appendToCommentData(char), this.transitionTo("comment"));
          },
          commentStartDash: function () {
            var char = this.consume();
            "-" === char ? this.transitionTo("commentEnd") : ">" === char ? (this.delegate.finishComment(), this.transitionTo("beforeData")) : (this.delegate.appendToCommentData("-"), this.transitionTo("comment"));
          },
          comment: function () {
            var char = this.consume();
            "-" === char ? this.transitionTo("commentEndDash") : this.delegate.appendToCommentData(char);
          },
          commentEndDash: function () {
            var char = this.consume();
            "-" === char ? this.transitionTo("commentEnd") : (this.delegate.appendToCommentData("-" + char), this.transitionTo("comment"));
          },
          commentEnd: function () {
            var char = this.consume();
            ">" === char ? (this.delegate.finishComment(), this.transitionTo("beforeData")) : (this.delegate.appendToCommentData("--" + char), this.transitionTo("comment"));
          },
          tagName: function () {
            var char = this.consume();
            isSpace(char) ? this.transitionTo("beforeAttributeName") : "/" === char ? this.transitionTo("selfClosingStartTag") : ">" === char ? (this.delegate.finishTag(), this.transitionTo("beforeData")) : this.appendToTagName(char);
          },
          endTagName: function () {
            var char = this.consume();
            isSpace(char) ? (this.transitionTo("beforeAttributeName"), this.tagNameBuffer = "") : "/" === char ? (this.transitionTo("selfClosingStartTag"), this.tagNameBuffer = "") : ">" === char ? (this.delegate.finishTag(), this.transitionTo("beforeData"), this.tagNameBuffer = "") : this.appendToTagName(char);
          },
          beforeAttributeName: function () {
            var char = this.peek();
            isSpace(char) ? this.consume() : "/" === char ? (this.transitionTo("selfClosingStartTag"), this.consume()) : ">" === char ? (this.consume(), this.delegate.finishTag(), this.transitionTo("beforeData")) : "=" === char ? (this.delegate.reportSyntaxError("attribute name cannot start with equals sign"), this.transitionTo("attributeName"), this.delegate.beginAttribute(), this.consume(), this.delegate.appendToAttributeName(char)) : (this.transitionTo("attributeName"), this.delegate.beginAttribute());
          },
          attributeName: function () {
            var char = this.peek();
            isSpace(char) ? (this.transitionTo("afterAttributeName"), this.consume()) : "/" === char ? (this.delegate.beginAttributeValue(!1), this.delegate.finishAttributeValue(), this.consume(), this.transitionTo("selfClosingStartTag")) : "=" === char ? (this.transitionTo("beforeAttributeValue"), this.consume()) : ">" === char ? (this.delegate.beginAttributeValue(!1), this.delegate.finishAttributeValue(), this.consume(), this.delegate.finishTag(), this.transitionTo("beforeData")) : '"' === char || "'" === char || "<" === char ? (this.delegate.reportSyntaxError(char + " is not a valid character within attribute names"), this.consume(), this.delegate.appendToAttributeName(char)) : (this.consume(), this.delegate.appendToAttributeName(char));
          },
          afterAttributeName: function () {
            var char = this.peek();
            isSpace(char) ? this.consume() : "/" === char ? (this.delegate.beginAttributeValue(!1), this.delegate.finishAttributeValue(), this.consume(), this.transitionTo("selfClosingStartTag")) : "=" === char ? (this.consume(), this.transitionTo("beforeAttributeValue")) : ">" === char ? (this.delegate.beginAttributeValue(!1), this.delegate.finishAttributeValue(), this.consume(), this.delegate.finishTag(), this.transitionTo("beforeData")) : (this.delegate.beginAttributeValue(!1), this.delegate.finishAttributeValue(), this.transitionTo("attributeName"), this.delegate.beginAttribute(), this.consume(), this.delegate.appendToAttributeName(char));
          },
          beforeAttributeValue: function () {
            var char = this.peek();
            isSpace(char) ? this.consume() : '"' === char ? (this.transitionTo("attributeValueDoubleQuoted"), this.delegate.beginAttributeValue(!0), this.consume()) : "'" === char ? (this.transitionTo("attributeValueSingleQuoted"), this.delegate.beginAttributeValue(!0), this.consume()) : ">" === char ? (this.delegate.beginAttributeValue(!1), this.delegate.finishAttributeValue(), this.consume(), this.delegate.finishTag(), this.transitionTo("beforeData")) : (this.transitionTo("attributeValueUnquoted"), this.delegate.beginAttributeValue(!1), this.consume(), this.delegate.appendToAttributeValue(char));
          },
          attributeValueDoubleQuoted: function () {
            var char = this.consume();
            '"' === char ? (this.delegate.finishAttributeValue(), this.transitionTo("afterAttributeValueQuoted")) : "&" === char ? this.delegate.appendToAttributeValue(this.consumeCharRef() || "&") : this.delegate.appendToAttributeValue(char);
          },
          attributeValueSingleQuoted: function () {
            var char = this.consume();
            "'" === char ? (this.delegate.finishAttributeValue(), this.transitionTo("afterAttributeValueQuoted")) : "&" === char ? this.delegate.appendToAttributeValue(this.consumeCharRef() || "&") : this.delegate.appendToAttributeValue(char);
          },
          attributeValueUnquoted: function () {
            var char = this.peek();
            isSpace(char) ? (this.delegate.finishAttributeValue(), this.consume(), this.transitionTo("beforeAttributeName")) : "/" === char ? (this.delegate.finishAttributeValue(), this.consume(), this.transitionTo("selfClosingStartTag")) : "&" === char ? (this.consume(), this.delegate.appendToAttributeValue(this.consumeCharRef() || "&")) : ">" === char ? (this.delegate.finishAttributeValue(), this.consume(), this.delegate.finishTag(), this.transitionTo("beforeData")) : (this.consume(), this.delegate.appendToAttributeValue(char));
          },
          afterAttributeValueQuoted: function () {
            var char = this.peek();
            isSpace(char) ? (this.consume(), this.transitionTo("beforeAttributeName")) : "/" === char ? (this.consume(), this.transitionTo("selfClosingStartTag")) : ">" === char ? (this.consume(), this.delegate.finishTag(), this.transitionTo("beforeData")) : this.transitionTo("beforeAttributeName");
          },
          selfClosingStartTag: function () {
            ">" === this.peek() ? (this.consume(), this.delegate.markTagAsSelfClosing(), this.delegate.finishTag(), this.transitionTo("beforeData")) : this.transitionTo("beforeAttributeName");
          },
          endTagOpen: function () {
            var char = this.consume();
            ("@" === char || ":" === char || isAlpha(char)) && (this.transitionTo("endTagName"), this.tagNameBuffer = "", this.delegate.beginEndTag(), this.appendToTagName(char));
          }
        }, this.reset();
      }
      return EventedTokenizer.prototype.reset = function () {
        this.transitionTo("beforeData"), this.input = "", this.tagNameBuffer = "", this.index = 0, this.line = 1, this.column = 0, this.delegate.reset();
      }, EventedTokenizer.prototype.transitionTo = function (state) {
        this.state = state;
      }, EventedTokenizer.prototype.tokenize = function (input) {
        this.reset(), this.tokenizePart(input), this.tokenizeEOF();
      }, EventedTokenizer.prototype.tokenizePart = function (input) {
        for (this.input += function (input) {
          return input.replace(CRLF, "\n");
        }(input); this.index < this.input.length;) {
          var handler = this.states[this.state];
          if (void 0 === handler) throw new Error("unhandled state " + this.state);
          handler.call(this);
        }
      }, EventedTokenizer.prototype.tokenizeEOF = function () {
        this.flushData();
      }, EventedTokenizer.prototype.flushData = function () {
        "data" === this.state && (this.delegate.finishData(), this.transitionTo("beforeData"));
      }, EventedTokenizer.prototype.peek = function () {
        return this.input.charAt(this.index);
      }, EventedTokenizer.prototype.consume = function () {
        var char = this.peek();
        return this.index++, "\n" === char ? (this.line++, this.column = 0) : this.column++, char;
      }, EventedTokenizer.prototype.consumeCharRef = function () {
        var endIndex = this.input.indexOf(";", this.index);
        if (-1 !== endIndex) {
          var entity = this.input.slice(this.index, endIndex),
            chars = this.entityParser.parse(entity);
          if (chars) {
            for (var count = entity.length; count;) this.consume(), count--;
            return this.consume(), chars;
          }
        }
      }, EventedTokenizer.prototype.markTagStart = function () {
        this.delegate.tagOpen();
      }, EventedTokenizer.prototype.appendToTagName = function (char) {
        this.tagNameBuffer += char, this.delegate.appendToTagName(char);
      }, EventedTokenizer.prototype.isIgnoredEndTag = function () {
        var tag = this.tagNameBuffer;
        return "title" === tag && "</title>" !== this.input.substring(this.index, this.index + 8) || "style" === tag && "</style>" !== this.input.substring(this.index, this.index + 8) || "script" === tag && "<\/script>" !== this.input.substring(this.index, this.index + 9);
      }, EventedTokenizer;
    }(),
    Tokenizer = function () {
      function Tokenizer(entityParser, options) {
        void 0 === options && (options = {}), this.options = options, this.token = null, this.startLine = 1, this.startColumn = 0, this.tokens = [], this.tokenizer = new EventedTokenizer(this, entityParser, options.mode), this._currentAttribute = void 0;
      }
      return Tokenizer.prototype.tokenize = function (input) {
        return this.tokens = [], this.tokenizer.tokenize(input), this.tokens;
      }, Tokenizer.prototype.tokenizePart = function (input) {
        return this.tokens = [], this.tokenizer.tokenizePart(input), this.tokens;
      }, Tokenizer.prototype.tokenizeEOF = function () {
        return this.tokens = [], this.tokenizer.tokenizeEOF(), this.tokens[0];
      }, Tokenizer.prototype.reset = function () {
        this.token = null, this.startLine = 1, this.startColumn = 0;
      }, Tokenizer.prototype.current = function () {
        var token = this.token;
        if (null === token) throw new Error("token was unexpectedly null");
        if (0 === arguments.length) return token;
        for (var i = 0; i < arguments.length; i++) if (token.type === arguments[i]) return token;
        throw new Error("token type was unexpectedly " + token.type);
      }, Tokenizer.prototype.push = function (token) {
        this.token = token, this.tokens.push(token);
      }, Tokenizer.prototype.currentAttribute = function () {
        return this._currentAttribute;
      }, Tokenizer.prototype.addLocInfo = function () {
        this.options.loc && (this.current().loc = {
          start: {
            line: this.startLine,
            column: this.startColumn
          },
          end: {
            line: this.tokenizer.line,
            column: this.tokenizer.column
          }
        }), this.startLine = this.tokenizer.line, this.startColumn = this.tokenizer.column;
      }, Tokenizer.prototype.beginDoctype = function () {
        this.push({
          type: "Doctype",
          name: ""
        });
      }, Tokenizer.prototype.appendToDoctypeName = function (char) {
        this.current("Doctype").name += char;
      }, Tokenizer.prototype.appendToDoctypePublicIdentifier = function (char) {
        var doctype = this.current("Doctype");
        void 0 === doctype.publicIdentifier ? doctype.publicIdentifier = char : doctype.publicIdentifier += char;
      }, Tokenizer.prototype.appendToDoctypeSystemIdentifier = function (char) {
        var doctype = this.current("Doctype");
        void 0 === doctype.systemIdentifier ? doctype.systemIdentifier = char : doctype.systemIdentifier += char;
      }, Tokenizer.prototype.endDoctype = function () {
        this.addLocInfo();
      }, Tokenizer.prototype.beginData = function () {
        this.push({
          type: "Chars",
          chars: ""
        });
      }, Tokenizer.prototype.appendToData = function (char) {
        this.current("Chars").chars += char;
      }, Tokenizer.prototype.finishData = function () {
        this.addLocInfo();
      }, Tokenizer.prototype.beginComment = function () {
        this.push({
          type: "Comment",
          chars: ""
        });
      }, Tokenizer.prototype.appendToCommentData = function (char) {
        this.current("Comment").chars += char;
      }, Tokenizer.prototype.finishComment = function () {
        this.addLocInfo();
      }, Tokenizer.prototype.tagOpen = function () {}, Tokenizer.prototype.beginStartTag = function () {
        this.push({
          type: "StartTag",
          tagName: "",
          attributes: [],
          selfClosing: !1
        });
      }, Tokenizer.prototype.beginEndTag = function () {
        this.push({
          type: "EndTag",
          tagName: ""
        });
      }, Tokenizer.prototype.finishTag = function () {
        this.addLocInfo();
      }, Tokenizer.prototype.markTagAsSelfClosing = function () {
        this.current("StartTag").selfClosing = !0;
      }, Tokenizer.prototype.appendToTagName = function (char) {
        this.current("StartTag", "EndTag").tagName += char;
      }, Tokenizer.prototype.beginAttribute = function () {
        this._currentAttribute = ["", "", !1];
      }, Tokenizer.prototype.appendToAttributeName = function (char) {
        this.currentAttribute()[0] += char;
      }, Tokenizer.prototype.beginAttributeValue = function (isQuoted) {
        this.currentAttribute()[2] = isQuoted;
      }, Tokenizer.prototype.appendToAttributeValue = function (char) {
        this.currentAttribute()[1] += char;
      }, Tokenizer.prototype.finishAttributeValue = function () {
        this.current("StartTag").attributes.push(this._currentAttribute);
      }, Tokenizer.prototype.reportSyntaxError = function (message) {
        this.current().syntaxError = message;
      }, Tokenizer;
    }(),
    Do = Options,
    StartTag = "StartTag",
    EndTag = "EndTag",
    Chars = "Chars";
  function linkifyChars(str, opts) {
    for (var tokens = function (str) {
        return INIT.initialized || function () {
          INIT.scanner = {
            start: init$2(INIT.customProtocols),
            tokens: Oi
          }, INIT.parser = {
            start: init$1(),
            tokens: multi
          };
          for (var utils = {
              createTokenClass: createTokenClass
            }, i = 0; i < INIT.pluginQueue.length; i++) INIT.pluginQueue[i][1]({
            scanner: INIT.scanner,
            parser: INIT.parser,
            utils: utils
          });
          INIT.initialized = !0;
        }(), function (start, input, tokens) {
          for (var len = tokens.length, cursor = 0, multis = [], textTokens = []; cursor < len;) {
            for (var state = start, secondState = null, nextState = null, multiLength = 0, latestAccepting = null, sinceAccepts = -1; cursor < len && !(secondState = takeT(state, tokens[cursor].t));) textTokens.push(tokens[cursor++]);
            for (; cursor < len && (nextState = secondState || takeT(state, tokens[cursor].t));) secondState = null, (state = nextState).accepts() ? (sinceAccepts = 0, latestAccepting = state) : sinceAccepts >= 0 && sinceAccepts++, cursor++, multiLength++;
            if (sinceAccepts < 0) for (var i = cursor - multiLength; i < cursor; i++) textTokens.push(tokens[i]);else {
              textTokens.length > 0 && (multis.push(parserCreateMultiToken(Text, input, textTokens)), textTokens = []), cursor -= sinceAccepts, multiLength -= sinceAccepts;
              var Multi = latestAccepting.t,
                subtokens = tokens.slice(cursor - multiLength, cursor);
              multis.push(parserCreateMultiToken(Multi, input, subtokens));
            }
          }
          return textTokens.length > 0 && multis.push(parserCreateMultiToken(Text, input, textTokens)), multis;
        }(INIT.parser.start, str, function (start, str) {
          for (var iterable = function (str) {
              for (var result = [], len = str.length, index = 0; index < len;) {
                var first = str.charCodeAt(index),
                  second = void 0,
                  char = first < 55296 || first > 56319 || index + 1 === len || (second = str.charCodeAt(index + 1)) < 56320 || second > 57343 ? str[index] : str.slice(index, index + 2);
                result.push(char), index += char.length;
              }
              return result;
            }(str.replace(/[A-Z]/g, function (c) {
              return c.toLowerCase();
            })), charCount = iterable.length, tokens = [], cursor = 0, charCursor = 0; charCursor < charCount;) {
            for (var state = start, nextState = null, tokenLength = 0, latestAccepting = null, sinceAccepts = -1, charsSinceAccepts = -1; charCursor < charCount && (nextState = takeT(state, iterable[charCursor]));) (state = nextState).accepts() ? (sinceAccepts = 0, charsSinceAccepts = 0, latestAccepting = state) : sinceAccepts >= 0 && (sinceAccepts += iterable[charCursor].length, charsSinceAccepts++), tokenLength += iterable[charCursor].length, cursor += iterable[charCursor].length, charCursor++;
            cursor -= sinceAccepts, charCursor -= charsSinceAccepts, tokenLength -= sinceAccepts, tokens.push({
              t: latestAccepting.t,
              v: str.substr(cursor - tokenLength, tokenLength),
              s: cursor - tokenLength,
              e: cursor
            });
          }
          return tokens;
        }(INIT.scanner.start, str));
      }(str), result = [], i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if ("nl" === token.t && opts.nl2br) result.push({
        type: StartTag,
        tagName: "br",
        attributes: [],
        selfClosing: !0
      });else if (token.isLink && opts.check(token)) {
        var _opts$resolve = opts.resolve(token),
          formatted = _opts$resolve.formatted,
          formattedHref = _opts$resolve.formattedHref,
          tagName = _opts$resolve.tagName,
          className = _opts$resolve.className,
          target = _opts$resolve.target,
          rel = _opts$resolve.rel,
          attributes = _opts$resolve.attributes,
          truncate = _opts$resolve.truncate,
          attributeArray = [["href", formattedHref]];
        for (var attr in className && attributeArray.push(["class", className]), target && attributeArray.push(["target", target]), rel && attributeArray.push(["rel", rel]), truncate && formatted.length > truncate && (formatted = formatted.substring(0, truncate) + "…"), attributes) attributeArray.push([attr, attributes[attr]]);
        result.push({
          type: StartTag,
          tagName: tagName,
          attributes: attributeArray,
          selfClosing: !1
        }), result.push({
          type: Chars,
          chars: formatted
        }), result.push({
          type: EndTag,
          tagName: tagName
        });
      } else result.push({
        type: Chars,
        chars: token.toString()
      });
    }
    return result;
  }
  function skipTagTokens(tagName, tokens, i2, skippedTokens) {
    for (var stackCount = 1; i2 < tokens.length && stackCount > 0;) {
      var token = tokens[i2];
      token.type === StartTag && token.tagName.toUpperCase() === tagName ? stackCount++ : token.type === EndTag && token.tagName.toUpperCase() === tagName && stackCount--, skippedTokens.push(token), i2++;
    }
    return skippedTokens;
  }
  function attrsToStrings(attrs) {
    for (var attrStrs = [], i2 = 0; i2 < attrs.length; i2++) {
      var name = attrs[i2][0],
        value = attrs[i2][1];
      attrStrs.push("".concat(name, '="').concat(value.replace(/"/g, "&quot;"), '"'));
    }
    return attrStrs;
  }
  const Ao = {
    randomUUID: "undefined" != typeof crypto && crypto.randomUUID && crypto.randomUUID.bind(crypto)
  };
  let getRandomValues;
  const rnds8 = new Uint8Array(16);
  function rng() {
    if (!getRandomValues && (getRandomValues = "undefined" != typeof crypto && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !getRandomValues)) throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    return getRandomValues(rnds8);
  }
  const byteToHex = [];
  for (let i = 0; i < 256; ++i) byteToHex.push((i + 256).toString(16).slice(1));
  const So = function (options, buf, offset) {
      if (Ao.randomUUID && !buf && !options) return Ao.randomUUID();
      const rnds = (options = options || {}).random || (options.rng || rng)();
      if (rnds[6] = 15 & rnds[6] | 64, rnds[8] = 63 & rnds[8] | 128, buf) {
        offset = offset || 0;
        for (let i = 0; i < 16; ++i) buf[offset + i] = rnds[i];
        return buf;
      }
      return function (arr, offset = 0) {
        return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
      }(rnds);
    },
    base64url = input => btoa(input).replace(/\\-/g, "+").replace(/_/g, "/").replace(/=/g, "");
  var Io = function (e, t, n, s) {
    return new (n || (n = Promise))(function (i, o) {
      function r(e) {
        try {
          u(s.next(e));
        } catch (e) {
          o(e);
        }
      }
      function a(e) {
        try {
          u(s.throw(e));
        } catch (e) {
          o(e);
        }
      }
      function u(e) {
        var t;
        e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n(function (e) {
          e(t);
        })).then(r, a);
      }
      u((s = s.apply(e, t || [])).next());
    });
  };
  class ChatMain {
    static init() {
      return Io(this, void 0, void 0, function* () {
        chrome.runtime.onMessage.addListener(msg => {
          if (msg.type === MessageTypes.UpdaterNewMessage) {
            if (this.isThreadedMode) {
              let currentCount = this.unreadCount[msg.data.classroomId];
              currentCount ? currentCount++ : currentCount = 1, this.unreadCount[msg.data.classroomId] = currentCount, this.updateUnreadCount(msg.data.classroomId), this.updateTotalUnreadCount();
            } else if (msg.data.classroomId === this.currentClassroomId) this.fetchChats(!0);else {
              let currentCount = this.unreadCount[msg.data.classroomId];
              currentCount ? currentCount++ : currentCount = 1, this.unreadCount[msg.data.classroomId] = currentCount, this.updateUnreadCount(msg.data.classroomId), this.updateTotalUnreadCount();
            }
          } else if (msg.type === MessageTypes.Token) {
            const body = document.getElementById("chatUiBody");
            this.removeAllChildNodes(body), this.isThreadedMode ? this.buildThreadUi() : this.loadChatForClass.bind(this)(this.currentClassroomId);
          } else msg.type === MessageTypes.ChatConfigUpdate ? (this.classRooms = msg.classRooms, this.refreshChatUi(this.classRooms)) : msg.type === MessageTypes.OpenChatClassroom && (this.currentClassroomId = msg.classroomId, this.loadChatForClass.bind(this)(this.currentClassroomId));
        });
        const heading = document.getElementById("chatWindowHeader");
        heading && heading.addEventListener("click", this.headingClicked);
        const resizeHandler = () => {
          const chatBody = document.getElementById("chatUiBody");
          if (chatBody && (chatBody.style.height = window.innerHeight - 58 - 60 + "px"), !this.isThreadedMode) {
            const disabledNotification = document.getElementById("disabledNotification");
            disabledNotification && (disabledNotification.style.width = window.innerWidth - 34 + "px");
          }
          const tableBody = document.getElementById("chatThreadsBody");
          tableBody && (tableBody.style.height = window.innerHeight - 60 + "px");
        };
        window.addEventListener("resize", resizeHandler), window.addEventListener("load", resizeHandler);
        const info = yield ChatMain.sendRuntimeMessage({
          type: MessageTypes.ChatInfo
        });
        info && (this.userName = info.userDetails.user, this.baseUrl = info.baseUrl, this.classRooms = info.classRooms, this.applianceId = info.applianceId, this.buildThreadUi()), ChatMain.sendRuntimeMessage({
          type: MessageTypes.NativeTokenAuthenticate
        });
      });
    }
    static sendRuntimeMessage(request) {
      return Io(this, void 0, void 0, function* () {
        return new Promise(resolve => {
          chrome.runtime.sendMessage(request, response => {
            resolve(response);
          });
        });
      });
    }
    static buildThreadUi() {
      this.clearChatController(), this.isThreadedMode = !0;
      const chatHeader = document.getElementById("chatWindowHeader");
      chatHeader.style.borderBottom = "1px solid #C3C3C3";
      const cwIcon = document.createElement("img");
      cwIcon.id = "cwIcon", cwIcon.src = "assets/imgs/linewizeIcon.svg", chatHeader.append(cwIcon);
      const heading = document.createElement("div");
      heading.id = "chatThreadHeading", heading.className = "classroomName", heading.innerText = "Classwize Chat", chatHeader.append(heading);
      const body = document.getElementById("chatUiBody");
      body.style.borderTop = "1px solid #E2E2E2";
      const threads = document.createElement("table");
      threads.style.width = "100%", threads.style.borderSpacing = "0px", threads.id = "chatThreads", body.appendChild(threads);
      const tableBody = document.createElement("tbody");
      tableBody.id = "chatThreadsBody", tableBody.style.width = "100%", tableBody.style.overflow = "auto", tableBody.style.display = "block", tableBody.style.height = window.innerHeight - 60 + "px", threads.appendChild(tableBody), Object.keys(this.classRooms).forEach(id => {
        if (this.classRooms[id].isActive) {
          const thread = this.chatThreadElement(id),
            row = document.createElement("tr"),
            cell = document.createElement("td");
          cell.style.width = "100%", cell.style.borderBottom = "1px solid #F2F2F2", cell.append(thread), row.append(cell), row.append(document.createElement("td")), tableBody.append(row);
        }
      }), this.sortChatThreadView();
    }
    static updateUnreadCount(classroomId) {
      const notificationValue = document.getElementById("unreadValue" + classroomId);
      if (notificationValue) {
        const unreadMessageCount = this.unreadCount[classroomId],
          unreadDisplayValue = unreadMessageCount ? unreadMessageCount > 9 ? "9+" : unreadMessageCount : "";
        notificationValue.innerHTML = String(unreadDisplayValue);
      }
    }
    static createTimeElement(msgTime) {
      const timestamp = document.createElement("span");
      return timestamp.className = "ClassroomChatroom_timeStamp", timestamp.innerHTML = msgTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      }).toLowerCase(), timestamp;
    }
    static getDateString(date1) {
      const milliSecondsOneDay = 864e5,
        day1Day = Math.floor(date1.getTime() / milliSecondsOneDay),
        todayDay = Math.floor(Date.now() / milliSecondsOneDay);
      return day1Day === todayDay ? "Today" : todayDay - day1Day <= 7 ? date1.toLocaleDateString("en-US", {
        weekday: "long"
      }) : ((date = date1.getDate()) < 10 ? "0" : "") + date + " " + date1.toLocaleString("default", {
        month: "short"
      }) + " " + date1.getFullYear();
      var date;
    }
    static createDateTimeElement(msgDateTime) {
      const dateString = this.getDateString(msgDateTime),
        dayContainer = document.createElement("div");
      return dayContainer.className = "ClassroomChatroom_date", dayContainer.innerHTML = dateString + ", ", dayContainer.id = dateString, dayContainer.append(this.createTimeElement(msgDateTime)), dayContainer;
    }
    static removeTimeStamp(parent) {
      if (parent) {
        const dateTime = parent.getElementsByClassName("ClassroomChatroom_date");
        dateTime && dateTime.length && dateTime[0].remove();
      }
    }
    static removeDisplayName(parent) {
      if (parent) {
        const displayName = parent.getElementsByClassName("ClassroomChat_displayName");
        displayName && displayName.length && displayName[0].remove();
      }
    }
    static hideAvatar(parent) {
      if (parent) for (const node of parent.children) {
        const avatar = node.getElementsByClassName("ClassroomChat_avatar");
        if (avatar && avatar.length) {
          avatar[0].style.visibility = "hidden";
          break;
        }
      }
    }
    static createChatDisableNotification(message) {
      if (document.getElementById("disabledNotification")) return;
      const inputContainer = document.getElementById("chatInputControl");
      inputContainer && (inputContainer.style.visibility = "hidden");
      const container = document.createElement("div");
      container.id = "disabledNotification", container.className = "ClassroomChatroom_footer", container.style.zIndex = String(Number.MAX_SAFE_INTEGER), container.style.width = window.innerWidth - 34 + "px";
      const msg = document.createElement("div");
      msg.innerHTML = message + " ", container.append(msg);
      const learnMore = document.createElement("span"),
        a2 = document.createElement("a"),
        link = document.createTextNode("Learn more");
      a2.append(link), a2.href = "https://dyzz9obi78pm5.cloudfront.net/app/image/id/60ffc732498ccce8297b23c8/n/cw-chat-students-using-classwize-this.pdf", a2.target = "_blank", learnMore.append(a2), msg.append(learnMore);
      const body = document.getElementById("chatUiBody");
      null == body || body.append(container);
    }
    static removeDisabledNotification() {
      const container = document.getElementById("disabledNotification");
      container && container.remove();
      const inputContainer = document.getElementById("chatInputControl");
      inputContainer && (inputContainer.style.visibility = "visible");
    }
    static refreshChatUi(classRooms) {
      this.isThreadedMode ? (Object.keys(classRooms).forEach(id => {
        this.updateClassActiveStatus(id);
      }), this.sortChatThreadView()) : !classRooms[this.currentClassroomId].chatBlocked && classRooms[this.currentClassroomId].isActive ? this.removeDisabledNotification() : classRooms[this.currentClassroomId].chatBlocked ? this.createChatDisableNotification("Your teacher has disabled this.") : classRooms[this.currentClassroomId].isActive || this.createChatDisableNotification("Chat is disabled until your class is online again.");
    }
    static scrollChatToBottom() {
      const conversation = document.getElementById("chatMessageConversation");
      conversation && (conversation.scrollTop = conversation.scrollHeight);
    }
    static createSendIndicator(msgId) {
      const sendIndicator = document.createElement("div");
      return sendIndicator.id = "sendIndicator" + msgId, sendIndicator.className = "ClassroomChatroom_sendStatus", sendIndicator;
    }
    static createSendProgress() {
      const container = document.createElement("div");
      container.className = "sendStatusContainer";
      const progressIcon = document.createElement("img");
      progressIcon.src = "assets/imgs/progress.svg", container.append(progressIcon);
      const sendingText = document.createElement("span");
      return sendingText.style.setProperty("padding-left", "3px"), sendingText.innerText = "Sending...", container.append(sendingText), container;
    }
    static createSendFailure(msgId) {
      const container = document.createElement("div");
      container.className = "sendStatusContainer";
      const errorIcon = document.createElement("img");
      errorIcon.src = "assets/imgs/error.svg", container.append(errorIcon);
      const retryText = document.createElement("span");
      retryText.style.setProperty("padding-left", "5px"), retryText.innerText = "Failed to send. ", container.append(retryText);
      const retry = document.createElement("span");
      return retry.innerHTML = "Retry?", retry.style.cursor = "pointer", retry.style.color = "blue", retry.addEventListener("click", () => {
        const sendIndicator = document.getElementById("sendIndicator" + msgId);
        sendIndicator && (this.removeAllChildNodes(sendIndicator), sendIndicator.appendChild(this.createSendProgress()), this.sendMessageBody(this.messagesToSend[msgId]));
      }), container.append(retry), container;
    }
    static createDailyReminder() {
      const dailyReminder = document.createElement("div");
      dailyReminder.id = "dailyReminder", dailyReminder.style.textAlign = "center", dailyReminder.style.marginTop = "16px", dailyReminder.style.color = "#51595D";
      const textNode = document.createTextNode("For your protection, this chat service is logged and monitored by your school district.");
      return dailyReminder.append(textNode), dailyReminder;
    }
    static isDailyReminderDisplayed() {
      return document.getElementById("dailyReminder");
    }
    static updateTotalUnreadCount() {
      let totalUnreadCount = 0;
      Object.keys(this.classRooms).forEach(id => {
        const count = this.unreadCount[id];
        count && count > 0 && (totalUnreadCount += count);
      }), ChatMain.sendRuntimeMessage({
        type: MessageTypes.UpdateTotalUnreadCount,
        unreadMessageCount: totalUnreadCount
      });
    }
    static removeAllChildNodes(parent) {
      for (; parent.firstChild;) parent.removeChild(parent.firstChild);
    }
    static showLoginScreen() {
      return Io(this, void 0, void 0, function* () {
        const data = yield ChatMain.sendRuntimeMessage({
          type: MessageTypes.ChatGetLastMessage
        });
        let textMsg = "Let your teacher know it's you",
          loginMsgBody = "Sign in with your school-associated Google account to send a message";
        if (data) {
          let teacherName = "Your teacher";
          if (data.sender && data.sender.username) for (const classroomKey in this.classRooms) {
            const currentClass = this.classRooms[classroomKey];
            if (currentClass.teacherInformation) {
              const {
                id: id,
                first_name: first_name,
                last_name: last_name
              } = currentClass.teacherInformation;
              if (id === data.sender.username && first_name && last_name) {
                teacherName = `${this.capitalizeString(first_name)} ${this.capitalizeString(last_name)}`;
                break;
              }
            }
          }
          textMsg = `${teacherName} has sent you a message`, loginMsgBody = "Sign in with your school-associated Google account to message them back!", ChatMain.sendRuntimeMessage({
            type: MessageTypes.ChatClearLastMessage
          });
        }
        this.clearChatController();
        const body = document.getElementById("chatUiBody"),
          loginContainer = document.createElement("div");
        loginContainer.style.height = "100%", loginContainer.style.display = "flex", loginContainer.style.flexDirection = "column", loginContainer.style.padding = "32px", loginContainer.style.justifyContent = "center", loginContainer.style.alignItems = "center";
        const loginHeader = document.createElement("p");
        loginHeader.innerHTML = textMsg, loginHeader.style.marginBottom = "8px", loginHeader.style.fontWeight = "700", loginHeader.style.fontSize = "16px", loginHeader.style.textAlign = "center", loginContainer.appendChild(loginHeader);
        const loginMessage = document.createElement("p");
        loginMessage.innerHTML = loginMsgBody, loginMessage.style.marginBottom = "32px", loginMessage.style.fontSize = "16px", loginMessage.style.textAlign = "center", loginContainer.appendChild(loginMessage);
        const loginWithGoogleButton = document.createElement("button");
        loginWithGoogleButton.style.border = "1px solid #0075DB", loginWithGoogleButton.style.background = "none", loginWithGoogleButton.style.padding = "16px 12px", loginWithGoogleButton.style.borderRadius = "6px", loginWithGoogleButton.style.display = "flex", loginWithGoogleButton.style.alignItems = "center", loginWithGoogleButton.style.cursor = "pointer", loginWithGoogleButton.onclick = () => {
          this.retryCount < 3 && (ChatMain.sendRuntimeMessage({
            type: MessageTypes.GoogleAuthenticate
          }), this.retryCount++);
        };
        const googleIcon = document.createElement("img");
        googleIcon.id = "googleIcon", googleIcon.src = "assets/imgs/googleIcon.svg", loginWithGoogleButton.append(googleIcon);
        const loginText = document.createElement("p");
        loginText.innerHTML = "Sign in with Google", loginText.style.color = "#000000", loginText.style.fontSize = "16px", loginText.style.margin = "0 0 0 8px", loginWithGoogleButton.append(loginText), loginContainer.appendChild(loginWithGoogleButton), body.appendChild(loginContainer);
      });
    }
    static clearChatController() {
      const chatHeader = document.getElementById("chatWindowHeader");
      this.removeAllChildNodes(chatHeader), chatHeader.style.borderBottom = "none";
      const body = document.getElementById("chatUiBody");
      this.removeAllChildNodes(body), body.style.borderTop = "none";
      const chatInputControl = document.getElementById("chatInputControl");
      this.removeAllChildNodes(chatInputControl), this.removeDisabledNotification();
    }
    static headingClicked() {
      this.isThreadedMode || (this.currentClassroomId = "", this.displayedMessages.clear(), this.buildThreadUi());
    }
    static scrollLoadMore(event) {
      0 === event.target.scrollTop && (this.userIsScrolling = !0, this.fetchChats());
    }
    static findColorIndex() {
      return Object.keys(this.classRooms).indexOf(this.currentClassroomId);
    }
    static buildChatUiHeading() {
      this.clearChatController(), this.isThreadedMode = !1;
      const chatHeader = document.getElementById("chatWindowHeader");
      chatHeader.style.setProperty("borderBottom", "1px solid #C3C3C3");
      const arrowLeft = document.createElement("i");
      arrowLeft.id = "arrowLeft", arrowLeft.className = "ClassroomChat_arrowLeft", chatHeader.append(arrowLeft);
      const className = this.classRooms[this.currentClassroomId].name || this.currentClassroomId,
        classEllipse = document.createElement("div");
      classEllipse.id = "classEllipse", classEllipse.className = "ClassroomChat_classEllipse", classEllipse.style.backgroundColor = this.bgColors[this.findColorIndex() % this.bgColors.length], classEllipse.innerHTML = className ? className[0].toUpperCase() : "T", chatHeader.append(classEllipse);
      const classRoomName = document.createElement("div");
      classRoomName.id = "classNameHeading", classRoomName.className = "ClassroomChatroom_nameHeading", classRoomName.innerText = className;
      const isClassActive = this.classRooms[this.currentClassroomId].isActive,
        teacher = document.createElement("div");
      teacher.id = "classTeacherName", teacher.className = "ClassroomChatroom_teacherHeading", teacher.innerText = isClassActive ? this.classOnline : this.classOffline, classRoomName.append(teacher), chatHeader.append(classRoomName);
    }
    static buildChatUi(newMessage) {
      if (!this.chatUiSkeletonRendered) {
        this.buildChatUiHeading();
        const body = document.getElementById("chatUiBody");
        body.style.borderTop = "1px solid #E2E2E2";
        const conversation = document.createElement("div");
        conversation.id = "chatMessageConversation", conversation.addEventListener("scroll", this.scrollLoadMore.bind(this)), body.appendChild(conversation);
        const progressContainer = document.createElement("div");
        progressContainer.id = "loadingProgress", progressContainer.className = "ClassroomChatroom_information";
        const progressImage = document.createElement("img");
        progressImage.src = "assets/imgs/loading.svg", progressContainer.append(progressImage);
        const loadingText = document.createElement("div");
        loadingText.style.marginTop = "16px", loadingText.innerHTML = "Loading messages", progressContainer.append(loadingText), conversation.append(progressContainer);
        const chatInputController = document.getElementById("chatInputControl"),
          inputTextContainer = document.createElement("div");
        inputTextContainer.className = "ClassroomChatroom_textAreaContainer";
        const inputText = document.createElement("textarea");
        inputText.className = "ClassroomChatroom_textArea", inputText.id = "chatInput", inputText.autocomplete = "off", inputText.rows = 1, inputText.maxLength = this.maxMessageLength, inputText.placeholder = "Type a message", inputText.disabled = !0, inputTextContainer.append(inputText);
        const sendIcon = document.createElement("input");
        sendIcon.type = "image", sendIcon.id = "sendIcon", sendIcon.src = "assets/imgs/sendDisabled.svg", sendIcon.style.cursor = "pointer", sendIcon.style.paddingRight = "8px", sendIcon.disabled = !0, chatInputController.append(inputTextContainer), chatInputController.append(sendIcon);
        const updateSendIcon = () => {
            sendIcon.disabled = 0 === inputText.value.length || inputText.value.length >= this.maxMessageLength, sendIcon.src = sendIcon.disabled ? "assets/imgs/sendDisabled.svg" : "assets/imgs/sendEnabled.svg";
          },
          resize = () => {
            inputText.style.height = "auto", inputText.style.height = inputText.scrollHeight + "px";
          },
          delayedResize = () => {
            window.setTimeout(resize, 0);
          };
        let observe;
        return sendIcon.addEventListener("click", () => this.sendMessage()), inputText.addEventListener("keydown", event => {
          "Enter" === event.key && inputText.textLength < this.maxMessageLength && (event.preventDefault(), this.sendMessage(), updateSendIcon()), delayedResize();
        }), inputText.addEventListener("input", () => {
          updateSendIcon(), resize();
        }), this.chatUiSkeletonRendered = !0, this.refreshChatUi(this.classRooms), observe = window.attachEvent ? (element, event, handler) => {
          element.attachEvent("on" + event, handler);
        } : (element, event, handler) => {
          element.addEventListener(event, handler, !1);
        }, observe(inputText, "cut", delayedResize), observe(inputText, "paste", delayedResize), void observe(inputText, "drop", delayedResize);
      }
      const loadingProgress = document.getElementById("loadingProgress");
      if (loadingProgress) {
        loadingProgress.remove();
        const inputText = document.getElementById("chatInput");
        inputText && (inputText.disabled = !1);
      }
      if (!this.threadChatMessages || 0 === this.threadChatMessages.length) {
        if (document.getElementById("noMessage")) return;
        const noMessageContainer = document.createElement("div");
        noMessageContainer.id = "noMessage", noMessageContainer.className = "ClassroomChatroom_information";
        const noMessageImage = document.createElement("img");
        noMessageImage.src = "assets/imgs/noMessage.svg", noMessageContainer.append(noMessageImage);
        const noMessageText = document.createElement("div");
        noMessageText.style.fontWeight = "bold", noMessageText.style.margin = "16px", noMessageText.innerHTML = "No messages yet", noMessageContainer.append(noMessageText);
        const protectionText = document.createElement("div");
        protectionText.innerHTML = "For your protection, this chat service is logged and monitored by your school district.", protectionText.style.marginTop = "16px", noMessageContainer.append(protectionText);
        const conversation = document.getElementById("chatMessageConversation");
        return void (conversation && conversation.append(noMessageContainer));
      }
      {
        const noMessageContainer = document.getElementById("noMessage");
        noMessageContainer && noMessageContainer.remove();
      }
      const orderedData = newMessage ? this.threadChatMessages.reverse() : this.threadChatMessages.slice(this.loadedMessageCount),
        conversation = document.getElementById("chatMessageConversation");
      for (const msg of orderedData) {
        if (this.displayedMessages.has(msg.id)) continue;
        const sender = this.userName === msg.sender.username ? null : msg.sender.displayName || msg.sender.username,
          teacherIndex = null === sender ? -1 : this.classRooms[this.currentClassroomId].teachers.indexOf(msg.sender.username),
          date = new Date(msg.timestamp),
          [message] = this.chatMessageElement(msg.message, date, msg.id, sender, teacherIndex);
        if (!this.lastRenderedLoadedNode || newMessage) {
          if (newMessage) {
            let lastTime = null;
            this.newestMessage && this.newestMessage.sender.username === msg.sender.username && (lastTime = new Date(this.newestMessage.timestamp), date.getTime() - lastTime.getTime() <= this.groupingTimeLimit && (this.removeTimeStamp(message), sender && (this.hideAvatar(this.lastRenderedIncomingNode), this.removeDisplayName(message))), date.getDay() !== lastTime.getDay() && (this.isDailyReminderDisplayed() || conversation.append(this.createDailyReminder()))), this.newestMessage = msg, this.lastRenderedIncomingNode = message, this.newestMessageTimestamp = lastTime;
          } else this.lastRenderedLoadedNode = message, this.oldestMessage = msg, this.newestMessage = msg, this.newestMessageTimestamp = new Date(msg.timestamp), sender && (this.lastRenderedIncomingNode = message);
          conversation.append(message);
        } else {
          const lastTime = new Date(this.oldestMessage.timestamp);
          if (this.oldestMessage && this.oldestMessage.sender.username === msg.sender.username && lastTime.getTime() - date.getTime() <= this.groupingTimeLimit && (this.removeTimeStamp(this.lastRenderedLoadedNode), this.removeDisplayName(this.lastRenderedLoadedNode), sender && this.hideAvatar(message)), date.getDay() !== lastTime.getDay() && !this.isDailyReminderDisplayed()) {
            const dailyReminder = this.createDailyReminder();
            conversation.insertBefore(dailyReminder, this.lastRenderedLoadedNode), this.lastRenderedLoadedNode = dailyReminder;
          }
          conversation.insertBefore(message, this.lastRenderedLoadedNode), this.lastRenderedLoadedNode = message, this.oldestMessage = msg;
        }
        newMessage || (this.lastRenderedLoadedNode = message), this.displayedMessages.add(msg.id), this.loadedMessageCount++;
      }
      this.chatInitialized ? newMessage && !this.userIsScrolling && this.scrollChatToBottom() : (this.scrollChatToBottom(), this.chatInitialized = !0);
    }
    static sendMessageBody(requestBody) {
      requestBody && this.processSendMessageBodyRequest(requestBody);
    }
    static sendMessage() {
      if (!this.classRooms[this.currentClassroomId].isActive) return void alert("Class is offline!");
      if (this.classRooms[this.currentClassroomId].chatBlocked) return void alert("Chat is disabled for this class");
      const message = document.getElementById("chatInput").value;
      if (!message || !message.trim()) return;
      const chatMessageConversation = document.getElementById("chatMessageConversation"),
        date = new Date(),
        msgId = So();
      this.newestMessageTimestamp && date.getDay() === this.newestMessageTimestamp.getDay() || this.isDailyReminderDisplayed() || chatMessageConversation.append(this.createDailyReminder());
      const [chatElement, messageDialog] = this.chatMessageElement(message, date, msgId);
      this.newestMessageTimestamp && date.getTime() - this.newestMessageTimestamp.getTime() <= this.groupingTimeLimit && this.newestMessage.sender.username === this.userName ? (this.removeTimeStamp(chatElement), this.removeDisplayName(chatElement)) : this.newestMessageTimestamp = date, chatMessageConversation.append(chatElement), this.loadedMessageCount++, document.getElementById("chatInput").value = "";
      const participants = this.classRooms[this.currentClassroomId].teachers.slice();
      participants.push(this.userName);
      const requestBody = {
        id: msgId,
        applianceId: this.applianceId,
        message: message,
        classroomId: this.currentClassroomId,
        sender: {
          displayName: this.userName,
          username: this.userName
        },
        participants: participants,
        threadKey: this.threadKey
      };
      this.newestMessage = requestBody, this.newestMessage.timestamp = date.toISOString();
      const sendIndicator = this.createSendIndicator(requestBody.id);
      sendIndicator.appendChild(this.createSendProgress()), chatMessageConversation && (chatMessageConversation.append(sendIndicator), chatMessageConversation.scrollTop = chatMessageConversation.scrollHeight), messageDialog.id = "sending" + requestBody.id, messageDialog.style.backgroundColor = this.sendingBgColor, messageDialog.style.color = "black", this.messagesToSend[requestBody.id] = requestBody, this.displayedMessages.add(requestBody.id);
      const noMessageContainer = document.getElementById("noMessage");
      noMessageContainer && noMessageContainer.remove(), this.sendMessageBody(requestBody);
    }
    static fetchChats(newMessage = !1) {
      if (!this.currentClassroomId) return;
      const [threadKey, error] = ((currentClassroomId, classRooms, userName) => {
        const threadKey = classRooms[currentClassroomId].threadKey;
        if (void 0 === threadKey) return ((currentClassroomId, classRooms, userName) => {
          const className = classRooms[currentClassroomId].name || currentClassroomId,
            teachers = classRooms[currentClassroomId].teachers,
            teacherString = teachers && teachers.length ? teachers.sort().join(",") : "",
            threadKey = base64url(`${teacherString},${userName},${currentClassroomId}`);
          return teacherString && userName && currentClassroomId && threadKey ? [threadKey, null] : ["", new Error(`Chat initialisation failed due to missing thread key for a class ${className}`)];
        })(currentClassroomId, classRooms, userName);
        if (null === threadKey) {
          const className = classRooms[currentClassroomId].name || currentClassroomId;
          return ["", new Error(`Chat initialisation failed due to missing thread key for a class ${className}`)];
        }
        return [threadKey, null];
      })(this.currentClassroomId, this.classRooms, this.userName);
      if (error) return void ((message, ...optionalParams) => {
        ((logLevel, message, ...optionalParams) => {
          No.sendRuntimeMessage({
            type: MessageTypes.ChatLogMessage,
            logLevel: logLevel,
            message: message,
            optionalParams: optionalParams
          });
        })(Ns.Error, message, optionalParams);
      })(error.message);
      this.threadKey = threadKey;
      let startAfter = "";
      this.loadedMessageCount >= this.chatLoadMsgCount && !newMessage && (startAfter = this.threadChatMessages[this.loadedMessageCount - 1].timestamp);
      const maxResults = `&maxResults=${this.chatLoadMsgCount}`,
        startAfterQuery = startAfter ? `&startAfter=${startAfter}` : "",
        url = this.baseUrl + `/message?classroomid=${base64url(this.currentClassroomId)}&threadKey=${this.threadKey}&username=${this.userName}&applianceId=${this.applianceId}` + maxResults + "&sortDirection=DESC" + startAfterQuery;
      this.processFetchChatsRequest(url, newMessage), this.chatUiSkeletonRendered || this.buildChatUi(newMessage);
    }
    static updateClassActiveStatus(classroomId) {
      const classStatus = document.getElementById("activeStatus" + classroomId);
      if (classStatus) {
        const isClassActive = this.classRooms[classroomId].isActive,
          classStatusValue = isClassActive ? this.classOnline : this.classOffline;
        classStatus.innerHTML = classStatusValue, classStatus.style.color = isClassActive ? "#009900" : "#666666", classStatus.style.fontWeight = isClassActive ? "bold" : "normal";
      }
    }
    static loadChatForClass(classroomId) {
      this.currentClassroomId = classroomId, this.threadChatMessages = [], this.loadedMessageCount = 0, this.lastRenderedLoadedNode = null, this.lastRenderedIncomingNode = null, this.chatInitialized = !1, this.chatUiSkeletonRendered = !1, this.displayedMessages.clear(), this.newestMessageTimestamp = null, this.newestMessage = null, this.oldestMessage = null, this.fetchChats();
    }
    static chatThreadElement(classroomId) {
      const row = document.createElement("div"),
        button = document.createElement("button");
      button.className = "ClassroomChatroom_rowContainer";
      const wrapper = document.createElement("div");
      wrapper.className = "Classroom_rowWrapper";
      const classInfo = document.createElement("div");
      classInfo.style.textAlign = "left";
      const classRoomName = document.createElement("div");
      classRoomName.innerHTML = this.classRooms[classroomId].name || classroomId, classRoomName.className = "ClassroomChatroom_name", classInfo.append(classRoomName);
      const isClassActive = this.classRooms[classroomId].isActive,
        classStatusValue = isClassActive ? this.classOnline : this.classOffline,
        classStatus = document.createElement("div");
      return classStatus.id = "activeStatus" + classroomId, classStatus.className = "ClassroomChatroom_classStatus", classStatus.innerHTML = classStatusValue, classStatus.style.color = isClassActive ? "#009900" : "#666666", classStatus.style.fontWeight = isClassActive ? "bold" : "normal", classInfo.append(classStatus), wrapper.append(classInfo), document.createElement("i").className = "ClassroomChat_arrowRight", button.append(wrapper), button.addEventListener("click", () => {
        this.loadChatForClass.bind(this)(classroomId);
      }), row.append(button), row;
    }
    static chatMessageElement(text, msgTime, msgId, sender, teacherIndex = 0) {
      if (!text) return [];
      const container = document.createElement("div");
      container.style.paddingTop = "4px", container.style.paddingBottom = "4px", container.style.paddingLeft = "8px";
      const message = document.createElement("div");
      if (message.style.display = "flex", message.style.alignItems = "center", sender || (message.style.flexDirection = "row-reverse", message.style.marginRight = "10px"), sender) {
        const avatar = document.createElement("div");
        avatar.className = "ClassroomChat_avatar";
        const colorIndex = this.findColorIndex() + teacherIndex + 1;
        avatar.style.backgroundColor = this.bgColors[colorIndex % this.bgColors.length], avatar.innerHTML = sender.toUpperCase()[0], avatar.id = "avatar" + msgId, message.appendChild(avatar);
      }
      const messageDialog = document.createElement("div"),
        name = document.createElement("div");
      if (name.className = "ClassroomChat_displayName", sender) {
        messageDialog.style.backgroundColor = "#E7E7E7", messageDialog.style.color = "black", messageDialog.style.marginLeft = "8px";
        const senderName = document.createElement("span");
        senderName.innerHTML = sender, senderName.style.fontWeight = "bold", senderName.style.marginLeft = "30px", name.appendChild(senderName);
      } else messageDialog.style.backgroundColor = "#1987d6", messageDialog.style.color = "white", name.style.textAlign = "right", name.style.marginRight = "10px";
      const dateTime = this.createDateTimeElement(msgTime);
      dateTime.id = "dateTime" + msgId, container.append(dateTime), container.appendChild(name), messageDialog.style.borderRadius = "1rem", messageDialog.style.display = "inline-block", messageDialog.style.padding = "12px 16px", messageDialog.style.maxWidth = "71%";
      const sanitizedInput = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\\"/g, "&quot;").replace(/\\'/g, "&#39;");
      return messageDialog.innerHTML = function (str) {
        var input,
          opts = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          tokens = (input = str, new Tokenizer(new EntityParser(HTML5NamedCharRefs), void 0).tokenize(input)),
          linkifiedTokens = [],
          linkified = [];
        opts = new Do(opts);
        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];
          if (token.type !== StartTag) {
            if (token.type === Chars) {
              var linkifedChars = linkifyChars(token.chars, opts);
              linkifiedTokens.push.apply(linkifiedTokens, linkifedChars);
            } else linkifiedTokens.push(token);
          } else {
            linkifiedTokens.push(token);
            var tagName = token.tagName.toUpperCase();
            if (!("A" === tagName || opts.ignoreTags.indexOf(tagName) >= 0)) continue;
            var preskipLen = linkifiedTokens.length;
            skipTagTokens(tagName, tokens, ++i, linkifiedTokens), i += linkifiedTokens.length - preskipLen - 1;
          }
        }
        for (var _i = 0; _i < linkifiedTokens.length; _i++) {
          var _token = linkifiedTokens[_i];
          switch (_token.type) {
            case StartTag:
              var link = "<" + _token.tagName;
              _token.attributes.length > 0 && (link += " " + attrsToStrings(_token.attributes).join(" ")), link += ">", linkified.push(link);
              break;
            case EndTag:
              linkified.push("</".concat(_token.tagName, ">"));
              break;
            case Chars:
              linkified.push(_token.chars);
              break;
            case "Comment":
              linkified.push("\x3c!--".concat(_token.chars, "--\x3e"));
              break;
            case "Doctype":
              var doctype = "<!DOCTYPE ".concat(_token.name);
              _token.publicIdentifier && (doctype += ' PUBLIC "'.concat(_token.publicIdentifier, '"')), _token.systemIdentifier && (doctype += ' "'.concat(_token.systemIdentifier, '"')), doctype += ">", linkified.push(doctype);
          }
        }
        return linkified.join("");
      }(sanitizedInput, {
        attributes: {
          style: `color:${sender ? "#0075DB" : "white"};`
        }
      }), messageDialog.style.wordWrap = "break-word", messageDialog.title = msgTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      }).toLowerCase(), message.appendChild(messageDialog), container.appendChild(message), [container, messageDialog];
    }
    static sortChatThreadView() {
      const table = document.getElementById("chatThreads");
      if (!table) return;
      let shouldSwitch,
        i2,
        switching = !0;
      for (; switching;) {
        switching = !1;
        const rows = table.rows;
        for (i2 = 0; i2 < rows.length - 1; i2++) {
          shouldSwitch = !1;
          const x = rows[i2].getElementsByClassName("ClassroomChatroom_classStatus")[0],
            y = rows[i2 + 1].getElementsByClassName("ClassroomChatroom_classStatus")[0],
            xOnline = -1 !== x.textContent.indexOf(this.classOnline),
            yOnline = -1 !== y.textContent.indexOf(this.classOnline);
          if (!xOnline && yOnline) {
            shouldSwitch = !0;
            break;
          }
          if (xOnline === yOnline) {
            const classX = rows[i2].getElementsByClassName("ClassroomChatroom_name")[0],
              classY = rows[i2 + 1].getElementsByClassName("ClassroomChatroom_name")[0];
            if (classX.textContent > classY.textContent) {
              shouldSwitch = !0;
              break;
            }
          }
        }
        shouldSwitch && (rows[i2].parentNode.insertBefore(rows[i2 + 1], rows[i2]), switching = !0);
      }
    }
    static capitalizeString(txt) {
      return txt ? txt.charAt(0).toUpperCase() + txt.slice(1) : "";
    }
    static processSendMessageBodyRequest(requestBody) {
      return Io(this, void 0, void 0, function* () {
        const response = yield fetch(`${this.baseUrl}/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });
        if (200 === response.status) {
          const body = yield response.json(),
            sendIndicator = document.getElementById("sendIndicator" + body.id);
          sendIndicator && sendIndicator.remove(), delete this.messagesToSend[body.id];
          const messageDialog = document.getElementById("sending" + body.id);
          messageDialog.style.backgroundColor = this.sentBgColor, messageDialog.style.color = "white", this.retryCount = 0;
        } else {
          const sendIndicator = document.getElementById("sendIndicator" + requestBody.id);
          sendIndicator && (this.removeAllChildNodes(sendIndicator), sendIndicator.appendChild(this.createSendFailure(requestBody.id)), 401 !== response.status && 403 !== response.status || this.showLoginScreen());
        }
      });
    }
    static processFetchChatsRequest(url, newMessage) {
      return Io(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        let noNewMessagesFetched = !1;
        if (this.userIsScrolling = !1, 200 === response.status) {
          const data = yield response.json();
          if (data && data.length) {
            if (this.threadChatMessages.length < this.chatLoadMsgCount) this.threadChatMessages = data, noNewMessagesFetched = !0;else {
              const tempMessages = [];
              data.forEach(message => {
                this.threadChatMessages.find(threadChatMessage => threadChatMessage.id === message.id) || tempMessages.push(message);
              }), 0 === tempMessages.length && (noNewMessagesFetched = !0), tempMessages.forEach(msg => this.threadChatMessages.push(msg));
            }
            const currentUnreadCount = this.unreadCount[this.currentClassroomId];
            data.length >= currentUnreadCount ? this.unreadCount[this.currentClassroomId] = 0 : this.unreadCount[this.currentClassroomId] = currentUnreadCount - data.length, this.updateTotalUnreadCount();
          } else noNewMessagesFetched = !0;
          this.buildChatUi(newMessage);
          const unreadMessages = this.threadChatMessages.filter(msg => !msg.isRead);
          if (unreadMessages.length) {
            const firstUnreadMessage = unreadMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
            this.retryCount = 0;
            const endPoint = this.baseUrl + "/thread/markasread",
              requestBody = {
                threadKey: this.threadKey,
                username: this.userName,
                applianceId: this.applianceId,
                firstUnreadMessageTime: firstUnreadMessage.timestamp
              };
            fetch(endPoint, {
              method: "POST",
              body: JSON.stringify(requestBody)
            });
          }
        } else 401 !== response.status && 403 !== response.status || this.showLoginScreen();
      });
    }
  }
  ChatMain.isThreadedMode = !0, ChatMain.chatInitialized = !1, ChatMain.chatUiSkeletonRendered = !1, ChatMain.loadedMessageCount = 0, ChatMain.retryCount = 0, ChatMain.unreadCount = {}, ChatMain.userIsScrolling = !1, ChatMain.messagesToSend = {}, ChatMain.chatLoadMsgCount = 15, ChatMain.displayedMessages = new Set(), ChatMain.maxMessageLength = 1e3, ChatMain.bgColors = ["#973AA8", "#FF9900", "#29D9C2", "#16C7FF", "#FF949B"], ChatMain.classOnline = "Class is online", ChatMain.classOffline = "Class is offline", ChatMain.sentBgColor = "#1987d6", ChatMain.sendingBgColor = "#0071EB19", ChatMain.groupingTimeLimit = 9e5;
  const No = ChatMain;
  ChatMain.init();
})();
//# sourceMappingURL=chat.bundle.js.map