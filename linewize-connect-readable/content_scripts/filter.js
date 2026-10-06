(() => {
  "use strict";

  var EVerdictAction;
  !function (EVerdictAction) {
    EVerdictAction[EVerdictAction.BLOCK = 0] = "BLOCK", EVerdictAction[EVerdictAction.ALLOW = 1] = "ALLOW";
  }(EVerdictAction || (EVerdictAction = {}));
  const t = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__,
    n = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__,
    SDK_VERSION = "8.40.0",
    o = globalThis;
  function getGlobalSingleton(name, creator, obj) {
    const gbl = obj || o,
      __SENTRY__ = gbl.__SENTRY__ = gbl.__SENTRY__ || {},
      versionedCarrier = __SENTRY__[SDK_VERSION] = __SENTRY__[SDK_VERSION] || {};
    return versionedCarrier[name] || (versionedCarrier[name] = creator());
  }
  const CONSOLE_LEVELS = ["debug", "info", "warn", "error", "log", "assert", "trace"],
    originalConsoleMethods = {};
  function c(callback) {
    if (!("console" in o)) return callback();
    const console2 = o.console,
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
  const u = getGlobalSingleton("logger", function () {
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
          enabled && c(() => {
            o.console[name](`Sentry Logger [${name}]:`, ...args);
          });
        };
      }) : CONSOLE_LEVELS.forEach(name => {
        logger[name] = () => {};
      }), logger;
    }),
    installedIntegrations = [];
  function afterSetupIntegrations(client, integrations) {
    for (const integration of integrations) integration && integration.afterAllSetup && integration.afterAllSetup(client);
  }
  function setupIntegration(client, integration, integrationIndex) {
    if (integrationIndex[integration.name]) t && u.log(`Integration skipped because it was already installed: ${integration.name}`);else {
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
      t && u.log(`Integration installed: ${integration.name}`);
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
  function b(wat) {
    return null === wat || isParameterizedString(wat) || "object" != typeof wat && "function" != typeof wat;
  }
  function isPlainObject(wat) {
    return isBuiltin(wat, "Object");
  }
  function isEvent(wat) {
    return "undefined" != typeof Event && isInstanceOf(wat, Event);
  }
  function S(wat) {
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
  const x = o;
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
    if (x.HTMLElement && elem instanceof HTMLElement && elem.dataset) {
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
      n && u.log(`Failed to replace method "${name}" in object`, source);
    }
  }
  function D(obj, name, value) {
    try {
      Object.defineProperty(obj, name, {
        value: value,
        writable: !0,
        configurable: !0
      });
    } catch (o_O) {
      n && u.log(`Failed to add non-enumerable property "${name}" to object`, obj);
    }
  }
  function markFunctionWrapped(wrapped, original) {
    try {
      const proto = original.prototype || {};
      wrapped.prototype = original.prototype = proto, D(wrapped, "__sentry_original__", original);
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
  function H() {
    const gbl = o,
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
      D(exception, "__sentry_captured__", !0);
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
          }(event) ? (t && u.warn(`Event dropped due to being internal Sentry Error.\nEvent: ${getEventDescription(event)}`), !0) : function (event, ignoreErrors) {
            return !(event.type || !ignoreErrors || !ignoreErrors.length) && function (event) {
              const possibleMessages = [];
              let lastException;
              event.message && possibleMessages.push(event.message);
              try {
                lastException = event.exception.values[event.exception.values.length - 1];
              } catch (e) {}
              return lastException && lastException.value && (possibleMessages.push(lastException.value), lastException.type && possibleMessages.push(`${lastException.type}: ${lastException.value}`)), possibleMessages;
            }(event).some(message => stringMatchesSomePattern(message, ignoreErrors));
          }(event, options.ignoreErrors) ? (t && u.warn(`Event dropped due to being matched by \`ignoreErrors\` option.\nEvent: ${getEventDescription(event)}`), !0) : function (event) {
            return !event.type && !(!event.exception || !event.exception.values || 0 === event.exception.values.length) && !event.message && !event.exception.values.some(value => value.stacktrace || value.type && "Error" !== value.type || value.value);
          }(event) ? (t && u.warn(`Event dropped due to not having an error message, error type or stacktrace.\nEvent: ${getEventDescription(event)}`), !0) : function (event, ignoreTransactions) {
            if ("transaction" !== event.type || !ignoreTransactions || !ignoreTransactions.length) return !1;
            const name = event.transaction;
            return !!name && stringMatchesSomePattern(name, ignoreTransactions);
          }(event, options.ignoreTransactions) ? (t && u.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.\nEvent: ${getEventDescription(event)}`), !0) : function (event, denyUrls) {
            if (!denyUrls || !denyUrls.length) return !1;
            const url = _getEventFilterUrl(event);
            return !!url && stringMatchesSomePattern(url, denyUrls);
          }(event, options.denyUrls) ? (t && u.warn(`Event dropped due to being matched by \`denyUrls\` option.\nEvent: ${getEventDescription(event)}.\nUrl: ${_getEventFilterUrl(event)}`), !0) : !function (event, allowUrls) {
            if (!allowUrls || !allowUrls.length) return !0;
            const url = _getEventFilterUrl(event);
            return !url || stringMatchesSomePattern(url, allowUrls);
          }(event, options.allowUrls) && (t && u.warn(`Event dropped due to not being matched by \`allowUrls\` option.\nEvent: ${getEventDescription(event)}.\nUrl: ${_getEventFilterUrl(event)}`), !0);
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
      return t && u.error(`Cannot extract url for event ${getEventDescription(event)}`), null;
    }
  }
  function J() {
    return X(o), o;
  }
  function X(carrier) {
    const __SENTRY__ = carrier.__SENTRY__ = carrier.__SENTRY__ || {};
    return __SENTRY__.version = __SENTRY__.version || SDK_VERSION, __SENTRY__[SDK_VERSION] = __SENTRY__[SDK_VERSION] || {};
  }
  function dateTimestampInSeconds() {
    return Date.now() / 1e3;
  }
  const Z = function () {
    const {
      performance: performance
    } = o;
    if (!performance || !performance.now) return dateTimestampInSeconds;
    const approxStartingTimeOrigin = Date.now() - performance.now(),
      timeOrigin = null == performance.timeOrigin ? approxStartingTimeOrigin : performance.timeOrigin;
    return () => (timeOrigin + performance.now()) / 1e3;
  }();
  let _browserPerformanceTimeOriginMode;
  function te(session, context = {}) {
    if (context.user && (!session.ipAddress && context.user.ip_address && (session.ipAddress = context.user.ip_address), session.did || context.did || (session.did = context.user.id || context.user.email || context.user.username)), session.timestamp = context.timestamp || Z(), context.abnormal_mechanism && (session.abnormal_mechanism = context.abnormal_mechanism), context.ignoreDuration && (session.ignoreDuration = context.ignoreDuration), context.sid && (session.sid = 32 === context.sid.length ? context.sid : H()), void 0 !== context.init && (session.init = context.init), !session.did && context.did && (session.did = `${context.did}`), "number" == typeof context.started && (session.started = context.started), session.ignoreDuration) session.duration = void 0;else if ("number" == typeof context.duration) session.duration = context.duration;else {
      const duration = session.timestamp - session.started;
      session.duration = duration >= 0 ? duration : 0;
    }
    context.release && (session.release = context.release), context.environment && (session.environment = context.environment), !session.ipAddress && context.ipAddress && (session.ipAddress = context.ipAddress), !session.userAgent && context.userAgent && (session.userAgent = context.userAgent), "number" == typeof context.errors && (session.errors = context.errors), context.status && (session.status = context.status);
  }
  function generatePropagationContext() {
    return {
      traceId: H(),
      spanId: H().substring(16)
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
    } = o;
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
    span ? D(scope, SCOPE_SPAN_FIELD, span) : delete scope[SCOPE_SPAN_FIELD];
  }
  function ie(scope) {
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
      }, newScope._client = this._client, newScope._lastEventId = this._lastEventId, _setSpanForScope(newScope, ie(this)), newScope;
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
      }, this._session && te(this._session, {
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
        [scopeInstance, requestSession] = scopeToMerge instanceof Scope ? [scopeToMerge.getScopeData(), scopeToMerge.getRequestSession()] : isPlainObject(scopeToMerge) ? [captureContext, captureContext.requestSession] : [],
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
        span: ie(this)
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
      const eventId = hint && hint.event_id ? hint.event_id : H();
      if (!this._client) return u.warn("No client configured on scope - will not capture exception!"), eventId;
      const syntheticException = new Error("Sentry syntheticException");
      return this._client.captureException(exception, {
        originalException: exception,
        syntheticException: syntheticException,
        ...hint,
        event_id: eventId
      }, this), eventId;
    }
    captureMessage(message, level, hint) {
      const eventId = hint && hint.event_id ? hint.event_id : H();
      if (!this._client) return u.warn("No client configured on scope - will not capture message!"), eventId;
      const syntheticException = new Error(message);
      return this._client.captureMessage(message, level, {
        originalException: message,
        syntheticException: syntheticException,
        ...hint,
        event_id: eventId
      }, this), eventId;
    }
    captureEvent(event, hint) {
      const eventId = hint && hint.event_id ? hint.event_id : H();
      return this._client ? (this._client.captureEvent(event, {
        ...hint,
        event_id: eventId
      }, this), eventId) : (u.warn("No client configured on scope - will not capture event!"), eventId);
    }
    _notifyScopeListeners() {
      this._notifyingListeners || (this._notifyingListeners = !0, this._scopeListeners.forEach(callback => {
        callback(this);
      }), this._notifyingListeners = !1);
    }
  }
  const Scope = ScopeClass;
  class AsyncContextStack {
    constructor(scope, isolationScope) {
      let assignedScope, assignedIsolationScope;
      assignedScope = scope || new Scope(), assignedIsolationScope = isolationScope || new Scope(), this._stack = [{
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
      return S(maybePromiseResult) ? maybePromiseResult.then(res => (this._popScope(), res), e => {
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
    return sentry.stack = sentry.stack || new AsyncContextStack(getGlobalSingleton("defaultCurrentScope", () => new Scope()), getGlobalSingleton("defaultIsolationScope", () => new Scope()));
  }
  function de(callback) {
    return getAsyncContextStack().withScope(callback);
  }
  function withSetScope(scope, callback) {
    const stack = getAsyncContextStack();
    return stack.withScope(() => (stack.getStackTop().scope = scope, callback(scope)));
  }
  function he(callback) {
    return getAsyncContextStack().withScope(() => callback(getAsyncContextStack().getIsolationScope()));
  }
  function fe(carrier) {
    const sentry = X(carrier);
    return sentry.acs ? sentry.acs : {
      withIsolationScope: he,
      withScope: de,
      withSetScope: withSetScope,
      withSetIsolationScope: (_isolationScope, callback) => he(callback),
      getCurrentScope: () => getAsyncContextStack().getScope(),
      getIsolationScope: () => getAsyncContextStack().getIsolationScope()
    };
  }
  function _e() {
    return fe(J()).getCurrentScope();
  }
  function ge() {
    return fe(J()).getIsolationScope();
  }
  function me() {
    return _e().getClient();
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
              context = SETUP_CLIENTS.has(me()) && void 0 !== originalFunction ? originalFunction : this;
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
          }(currentEvent, previousEvent)) return t && u.warn("Event dropped due to being a duplicate of previously captured event."), null;
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
    for (let i = 0; i < previousFrames.length; i++) {
      const frameA = previousFrames[i],
        frameB = currentFrames[i];
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
  const handlers = {},
    instrumented = {};
  function Ae(type, handler) {
    handlers[type] = handlers[type] || [], handlers[type].push(handler);
  }
  function Le(type, instrumentFn) {
    if (!instrumented[type]) {
      instrumented[type] = !0;
      try {
        instrumentFn();
      } catch (e) {
        n && u.error(`Error while instrumenting ${type}`, e);
      }
    }
  }
  function $e(type, data) {
    const typeHandlers = type && handlers[type];
    if (typeHandlers) for (const handler of typeHandlers) try {
      handler(data);
    } catch (e) {
      n && u.error(`Error while triggering instrumentation handler.\nType: ${type}\nName: ${getFunctionName(handler)}\nError:`, e);
    }
  }
  const Me = o;
  let debounceTimerID, lastCapturedEventType, lastCapturedEventTargetId;
  function instrumentDOM() {
    if (!Me.document) return;
    const triggerDOMHandler = $e.bind(null, "dom"),
      globalDOMEventHandler = makeDOMEventHandler(triggerDOMHandler, !0);
    Me.document.addEventListener("click", globalDOMEventHandler, !1), Me.document.addEventListener("keypress", globalDOMEventHandler, !1), ["EventTarget", "Node"].forEach(target => {
      const proto = Me[target] && Me[target].prototype;
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
      D(event, "_sentryCaptured", !0), target && !target._sentryId && D(target, "_sentryId", H());
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
      }), lastCapturedEventType = event.type, lastCapturedEventTargetId = target ? target._sentryId : void 0), clearTimeout(debounceTimerID), debounceTimerID = Me.setTimeout(() => {
        lastCapturedEventTargetId = void 0, lastCapturedEventType = void 0;
      }, 1e3);
    };
  }
  const SENTRY_XHR_DATA_KEY = "__sentry_xhr_v3__";
  function instrumentXHR() {
    if (!Me.XMLHttpRequest) return;
    const xhrproto = XMLHttpRequest.prototype;
    xhrproto.open = new Proxy(xhrproto.open, {
      apply(originalOpen, xhrOpenThisArg, xhrOpenArgArray) {
        const startTimestamp = 1e3 * Z(),
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
            $e("xhr", {
              endTimestamp: 1e3 * Z(),
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
        return sentryXhrData ? (void 0 !== sendArgArray[0] && (sentryXhrData.body = sendArgArray[0]), $e("xhr", {
          startTimestamp: 1e3 * Z(),
          xhr: sendThisArg
        }), originalSend.apply(sendThisArg, sendArgArray)) : originalSend.apply(sendThisArg, sendArgArray);
      }
    });
  }
  const qe = o;
  let lastHref;
  function instrumentHistory() {
    if (!function () {
      const chromeVar = qe.chrome,
        isChromePackagedApp = chromeVar && chromeVar.app && chromeVar.app.runtime,
        hasHistoryApi = "history" in qe && !!qe.history.pushState && !!qe.history.replaceState;
      return !isChromePackagedApp && hasHistoryApi;
    }()) return;
    const oldOnPopState = Me.onpopstate;
    function historyReplacementFunction(originalHistoryFunction) {
      return function (...args) {
        const url = args.length > 2 ? args[2] : void 0;
        if (url) {
          const from = lastHref,
            to = String(url);
          lastHref = to, $e("history", {
            from: from,
            to: to
          });
        }
        return originalHistoryFunction.apply(this, args);
      };
    }
    Me.onpopstate = function (...args) {
      const to = Me.location.href,
        from = lastHref;
      if (lastHref = to, $e("history", {
        from: from,
        to: to
      }), oldOnPopState) try {
        return oldOnPopState.apply(this, args);
      } catch (_oO) {}
    }, fill(Me.history, "pushState", historyReplacementFunction), fill(Me.history, "replaceState", historyReplacementFunction);
  }
  function instrumentConsole() {
    "console" in o && CONSOLE_LEVELS.forEach(function (level) {
      level in o.console && fill(o.console, level, function (originalConsoleMethod) {
        return originalConsoleMethods[level] = originalConsoleMethod, function (...args) {
          $e("console", {
            args: args,
            level: level
          });
          const log = originalConsoleMethods[level];
          log && log.apply(o.console, args);
        };
      });
    });
  }
  const ze = o;
  function isNativeFunction(func) {
    return func && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(func.toString());
  }
  function instrumentFetch(onFetchResolved, skipNativeFetchCheck = !1) {
    skipNativeFetchCheck && !function () {
      if ("string" == typeof EdgeRuntime) return !0;
      if (!function () {
        if (!("fetch" in ze)) return !1;
        try {
          return new Headers(), new Request("http://www.example.com"), new Response(), !0;
        } catch (e) {
          return !1;
        }
      }()) return !1;
      if (isNativeFunction(ze.fetch)) return !0;
      let result = !1;
      const doc = ze.document;
      if (doc && "function" == typeof doc.createElement) try {
        const sandbox = doc.createElement("iframe");
        sandbox.hidden = !0, doc.head.appendChild(sandbox), sandbox.contentWindow && sandbox.contentWindow.fetch && (result = isNativeFunction(sandbox.contentWindow.fetch)), doc.head.removeChild(sandbox);
      } catch (err) {
        n && u.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", err);
      }
      return result;
    }() || fill(o, "fetch", function (originalFetch) {
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
            startTimestamp: 1e3 * Z()
          };
        onFetchResolved || $e("fetch", {
          ...handlerData
        });
        const virtualStackTrace = new Error().stack;
        return originalFetch.apply(o, args).then(async response => (onFetchResolved ? onFetchResolved(response) : $e("fetch", {
          ...handlerData,
          endTimestamp: 1e3 * Z(),
          response: response
        }), response), error => {
          throw $e("fetch", {
            ...handlerData,
            endTimestamp: 1e3 * Z(),
            error: error
          }), isError(error) && void 0 === error.stack && (error.stack = virtualStackTrace, D(error, "framesToPop", 1)), error;
        });
      };
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
    const client = me(),
      isolationScope = ge();
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
      finalBreadcrumb = beforeBreadcrumb ? c(() => beforeBreadcrumb(mergedBreadcrumb, hint)) : mergedBreadcrumb;
    null !== finalBreadcrumb && (client.emit && client.emit("beforeAddBreadcrumb", finalBreadcrumb, hint), isolationScope.addBreadcrumb(finalBreadcrumb, maxBreadcrumbs));
  }
  const validSeverityLevels = ["fatal", "error", "warning", "log", "info", "debug"];
  function getBreadcrumbLogLevelFromHttpStatusCode(statusCode) {
    return void 0 === statusCode ? void 0 : statusCode >= 400 && statusCode < 500 ? "warning" : statusCode >= 500 ? "error" : void 0;
  }
  function ot(url) {
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
  const st = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__,
    it = "production";
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
        this._state === States.PENDING && (S(value) ? value.then(this._resolve, this._reject) : (this._state = state, this._value = value, this._executeHandlers()));
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
        t && processor.id && null === result && u.log(`Event processor "${processor.id}" dropped event`), S(result) ? result.then(final => notifyEventProcessors(processors, final, hint, index + 1).then(resolve)).then(null, reject) : notifyEventProcessors(processors, result, hint, index + 1).then(resolve).then(null, reject);
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
      } = wt(span);
    return j({
      parent_span_id: parent_span_id,
      span_id: span_id,
      trace_id: trace_id
    });
  }
  function spanTimeInputToSeconds(input) {
    return "number" == typeof input ? ensureTimestampInSeconds(input) : Array.isArray(input) ? input[0] + input[1] / 1e9 : input instanceof Date ? ensureTimestampInSeconds(input.getTime()) : Z();
  }
  function ensureTimestampInSeconds(timestamp) {
    return timestamp > 9999999999 ? timestamp / 1e3 : timestamp;
  }
  function wt(span) {
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
        environment: options.environment || it,
        release: options.release,
        public_key: public_key,
        trace_id: trace_id
      });
    return client.emit("createDsc", dsc), dsc;
  }
  function xt(span) {
    const client = me();
    if (!client) return {};
    const dsc = getDynamicSamplingContextFromClient(wt(span).trace_id || "", client),
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
    const jsonSpan = wt(rootSpan),
      attributes = jsonSpan.data || {},
      maybeSampleRate = attributes["sentry.sample_rate"];
    null != maybeSampleRate && (dsc.sample_rate = `${maybeSampleRate}`);
    const source = attributes["sentry.source"],
      name = jsonSpan.description;
    return "url" !== source && name && (dsc.transaction = name), function () {
      if ("boolean" == typeof __SENTRY_TRACING__ && !__SENTRY_TRACING__) return !1;
      const client = me(),
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
        event_id: event.event_id || hint.event_id || H(),
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
      "environment" in event || (event.environment = "environment" in options ? environment : it), void 0 === event.release && void 0 !== release && (event.release = release), void 0 === event.dist && void 0 !== dist && (event.dist = dist), event.message && (event.message = truncate(event.message, maxValueLength));
      const exception = event.exception && event.exception.values && event.exception.values[0];
      exception && exception.value && (exception.value = truncate(exception.value, maxValueLength));
      const request = event.request;
      request && request.url && (request.url = truncate(request.url, maxValueLength));
    }(prepared, options), function (event, integrationNames) {
      integrationNames.length > 0 && (event.sdk = event.sdk || {}, event.sdk.integrations = [...(event.sdk.integrations || []), ...integrationNames]);
    }(prepared, integrations), client && client.emit("applyFrameMetadata", event), void 0 === event.type && function (event, stackParser) {
      const filenameDebugIdMap = function (stackParser) {
        const debugIdMap = o._sentryDebugIds;
        if (!debugIdMap) return {};
        let debugIdStackFramesCache;
        const cachedDebugIdStackFrameCache = debugIdStackParserCache.get(stackParser);
        return cachedDebugIdStackFrameCache ? debugIdStackFramesCache = cachedDebugIdStackFrameCache : (debugIdStackFramesCache = new Map(), debugIdStackParserCache.set(stackParser, debugIdStackFramesCache)), Object.keys(debugIdMap).reduce((acc, debugIdStackTrace) => {
          let parsedStack;
          const cachedParsedStack = debugIdStackFramesCache.get(debugIdStackTrace);
          cachedParsedStack ? parsedStack = cachedParsedStack : (parsedStack = stackParser(debugIdStackTrace), debugIdStackFramesCache.set(debugIdStackTrace, parsedStack));
          for (let i2 = parsedStack.length - 1; i2 >= 0; i2--) {
            const stackFrame = parsedStack[i2],
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
      const finalScope = scope ? scope.clone() : new Scope();
      return finalScope.update(captureContext), finalScope;
    }(scope, hint.captureContext);
    hint.mechanism && addExceptionMechanism(prepared, hint.mechanism);
    const clientEventProcessors = client ? client.getEventProcessors() : [],
      data = getGlobalSingleton("globalScope", () => new Scope()).getScopeData();
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
          dynamicSamplingContext: xt(span),
          ...event.sdkProcessingMetadata
        };
        const transactionName = wt(getRootSpan(span)).description;
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
    return _e().captureEvent(event, hint);
  }
  const Nt = o;
  let ignoreOnError = 0;
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
          }, event)), exception = ex, _e().captureException(exception, function (hint) {
            if (hint) return function (hint) {
              return hint instanceof Scope || "function" == typeof hint;
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
    markFunctionWrapped(sentryWrapped, fn), D(fn, "__sentry_wrapped__", sentryWrapped);
    try {
      Object.getOwnPropertyDescriptor(sentryWrapped, "name").configurable && Object.defineProperty(sentryWrapped, "name", {
        get: () => fn.name
      });
    } catch (_oO) {}
    return sentryWrapped;
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
            Ae(type, handler), Le(type, instrumentConsole);
          }(function (client) {
            return function (handlerData) {
              if (me() !== client) return;
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
              if (me() !== client) return;
              let target,
                componentName,
                keyAttrs = "object" == typeof dom ? dom.serializeAttribute : void 0,
                maxStringLength = "object" == typeof dom && "number" == typeof dom.maxStringLength ? dom.maxStringLength : void 0;
              maxStringLength && maxStringLength > 1024 && (st && u.warn(`\`dom.maxStringLength\` cannot exceed 1024, but a value of ${maxStringLength} was configured. Sentry will use 1024 instead.`), maxStringLength = 1024), "string" == typeof keyAttrs && (keyAttrs = [keyAttrs]);
              try {
                const event = handlerData.event,
                  element = function (event) {
                    return !!event && !!event.target;
                  }(event) ? event.target : event;
                target = htmlTreeAsString(element, {
                  keyAttrs: keyAttrs,
                  maxStringLength: maxStringLength
                }), componentName = function (elem) {
                  if (!x.HTMLElement) return null;
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
          }(client, _options.dom), Ae("dom", handler), Le("dom", instrumentDOM)), _options.xhr && function (handler) {
            Ae("xhr", handler), Le("xhr", instrumentXHR);
          }(function (client) {
            return function (handlerData) {
              if (me() !== client) return;
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
            Ae(type, handler), Le(type, () => instrumentFetch(void 0, undefined));
          }(function (client) {
            return function (handlerData) {
              if (me() !== client) return;
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
          }(client)), _options.history && function (handler) {
            const type = "history";
            Ae(type, handler), Le(type, instrumentHistory);
          }(function (client) {
            return function (handlerData) {
              if (me() !== client) return;
              let from = handlerData.from,
                to = handlerData.to;
              const parsedLoc = ot(Nt.location.href);
              let parsedFrom = from ? ot(from) : void 0;
              const parsedTo = ot(to);
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
              me() === client && addBreadcrumb({
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
          _options.setTimeout && fill(Nt, "setTimeout", _wrapTimeFunction), _options.setInterval && fill(Nt, "setInterval", _wrapTimeFunction), _options.requestAnimationFrame && fill(Nt, "requestAnimationFrame", _wrapRAF), _options.XMLHttpRequest && "XMLHttpRequest" in Nt && fill(XMLHttpRequest.prototype, "send", _wrapXHR);
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
    const globalObject = Nt,
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
    _oldOnErrorHandler = o.onerror, o.onerror = function (msg, url, line, column, error) {
      return $e("error", {
        column: column,
        error: error,
        line: line,
        msg: msg,
        url: url
      }), !(!_oldOnErrorHandler || _oldOnErrorHandler.__SENTRY_LOADER__) && _oldOnErrorHandler.apply(this, arguments);
    }, o.onerror.__SENTRY_INSTRUMENTED__ = !0;
  }
  let _oldOnUnhandledRejectionHandler = null;
  function instrumentUnhandledRejection() {
    _oldOnUnhandledRejectionHandler = o.onunhandledrejection, o.onunhandledrejection = function (e) {
      return $e("unhandledrejection", e), !(_oldOnUnhandledRejectionHandler && !_oldOnUnhandledRejectionHandler.__SENTRY_LOADER__) || _oldOnUnhandledRejectionHandler.apply(this, arguments);
    }, o.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0;
  }
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
      const client = me(),
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
            Ae(type, data => {
              const {
                stackParser: stackParser,
                attachStacktrace: attachStacktrace
              } = getOptions();
              if (me() !== client || shouldIgnoreOnError()) return;
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
                        return x.document.location.href;
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
            }), Le(type, instrumentError);
          }();
        }(client), globalHandlerLog("onerror")), _options.onunhandledrejection && (function (client) {
          !function () {
            const type = "unhandledrejection";
            Ae(type, e => {
              const {
                stackParser: stackParser,
                attachStacktrace: attachStacktrace
              } = getOptions();
              if (me() !== client || shouldIgnoreOnError()) return;
              const error = function (error) {
                  if (b(error)) return error;
                  try {
                    if ("reason" in error) return error.reason;
                    if ("detail" in error && "reason" in error.detail) return error.detail.reason;
                  } catch (e2) {}
                  return error;
                }(e),
                event = b(error) ? {
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
            }), Le(type, instrumentUnhandledRejection);
          }();
        }(client), globalHandlerLog("onunhandledrejection"));
      }
    };
  };
  function globalHandlerLog(type) {
    st && u.log(`Global Handler attached: ${type}`);
  }
  function getOptions() {
    const client = me();
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
  const pn = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__,
    cachedImplementations = {};
  function clearCachedImplementation(name) {
    cachedImplementations[name] = void 0;
  }
  const DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
  function gn(dsn, withPassword = !1) {
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
  function yn(headers, items = []) {
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
    return o.__SENTRY__ && o.__SENTRY__.encodePolyfill ? o.__SENTRY__.encodePolyfill(input) : new TextEncoder().encode(input);
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
        const filteredEnvelope = yn(envelope[0], filteredEnvelopeItems),
          recordEnvelopeLoss = reason => {
            forEachEnvelopeItem(filteredEnvelope, (item, type) => {
              const event = getEventForEnvelopeItem(item, type);
              options.recordDroppedEvent(reason, envelopeItemTypeToDataCategory(type), event);
            });
          };
        return buffer.add(() => makeRequest({
          body: serializeEnvelope(filteredEnvelope)
        }).then(response => (void 0 !== response.statusCode && (response.statusCode < 200 || response.statusCode >= 300) && t && u.warn(`Sentry responded with status code ${response.statusCode} to sent event.`), rateLimits = function (limits, {
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
          if (error instanceof SentryError) return t && u.error("Skipped sending event because buffer is full."), recordEnvelopeLoss("queue_overflow"), resolvedSyncPromise({});
          throw error;
        });
      },
      flush: timeout => buffer.drain(timeout)
    };
  }
  function getEventForEnvelopeItem(item, type) {
    if ("event" === type || "transaction" === type) return Array.isArray(item) ? item[1] : void 0;
  }
  function Pn(options, nativeFetch = function (name) {
    const cached = cachedImplementations[name];
    if (cached) return cached;
    let impl = Me[name];
    if (isNativeFunction(impl)) return cachedImplementations[name] = impl.bind(Me);
    const document2 = Me.document;
    if (document2 && "function" == typeof document2.createElement) try {
      const sandbox = document2.createElement("iframe");
      sandbox.hidden = !0, document2.head.appendChild(sandbox);
      const contentWindow = sandbox.contentWindow;
      contentWindow && contentWindow[name] && (impl = contentWindow[name]), document2.head.removeChild(sandbox);
    } catch (e) {
      pn && u.warn(`Could not create sandbox iframe for ${name} check, bailing to window.${name}: `, e);
    }
    return impl ? cachedImplementations[name] = impl.bind(Me) : impl;
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
    Mn = function (...parsers) {
      const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map(p => p[1]);
      return (stack, skipFirstLines = 0, framesToPop = 0) => {
        const frames = [],
          lines = stack.split("\n");
        for (let i2 = skipFirstLines; i2 < lines.length; i2++) {
          const line = lines[i2];
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
    }([30, line => {
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
    };
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
  const ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";
  class BaseClient {
    constructor(options) {
      if (this._options = options, this._integrations = {}, this._numProcessing = 0, this._outcomes = {}, this._hooks = {}, this._eventProcessors = [], options.dsn ? this._dsn = function (from) {
        const components = "string" == typeof from ? function (str) {
          const match = DSN_REGEX.exec(str);
          if (!match) return void c(() => {
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
          return !(["protocol", "publicKey", "host", "projectId"].find(component => !dsn[component] && (u.error(`Invalid Sentry Dsn: ${component} missing`), !0)) || (projectId.match(/^\d+$/) ? function (protocol) {
            return "http" === protocol || "https" === protocol;
          }(protocol) ? port && isNaN(parseInt(port, 10)) && (u.error(`Invalid Sentry Dsn: Invalid port ${port}`), 1) : (u.error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`), 1) : (u.error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`), 1)));
        }(components)) return components;
      }(options.dsn) : t && u.warn("No DSN provided, client will not send events."), this._dsn) {
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
      const eventId = H();
      if (checkOrSetAlreadyCaught(exception)) return t && u.log(ALREADY_SEEN_ERROR), eventId;
      const hintWithEventId = {
        event_id: eventId,
        ...hint
      };
      return this._process(this.eventFromException(exception, hintWithEventId).then(event => this._captureEvent(event, hintWithEventId, scope))), hintWithEventId.event_id;
    }
    captureMessage(message, level, hint, currentScope) {
      const hintWithEventId = {
          event_id: H(),
          ...hint
        },
        eventMessage = isParameterizedString(message) ? message : String(message),
        promisedEvent = b(message) ? this.eventFromMessage(eventMessage, level, hintWithEventId) : this.eventFromException(message, hintWithEventId);
      return this._process(promisedEvent.then(event => this._captureEvent(event, hintWithEventId, currentScope))), hintWithEventId.event_id;
    }
    captureEvent(event, hint, currentScope) {
      const eventId = H();
      if (hint && hint.originalException && checkOrSetAlreadyCaught(hint.originalException)) return t && u.log(ALREADY_SEEN_ERROR), eventId;
      const hintWithEventId = {
          event_id: eventId,
          ...hint
        },
        capturedSpanScope = (event.sdkProcessingMetadata || {}).capturedSpanScope;
      return this._process(this._captureEvent(event, hintWithEventId, capturedSpanScope || currentScope)), hintWithEventId.event_id;
    }
    captureSession(session) {
      "string" != typeof session.release ? t && u.warn("Discarded session because of missing or non-string release") : (this.sendSession(session), te(session, {
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
              dsn: gn(dsn)
            }),
            ...(dynamicSamplingContext && {
              trace: j({
                ...dynamicSamplingContext
              })
            })
          };
        }(event, sdkInfo, tunnel, dsn);
        return delete event.sdkProcessingMetadata, yn(envelopeHeaders, [[{
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
        return yn({
          sent_at: new Date().toISOString(),
          ...(sdkInfo && {
            sdk: sdkInfo
          }),
          ...(!!tunnel && dsn && {
            dsn: gn(dsn)
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
        t && u.log(`Recording outcome: "${key}"${count > 1 ? ` (${count} times)` : ""}`), this._outcomes[key] = (this._outcomes[key] || 0) + count;
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
      return this.emit("beforeEnvelope", envelope), this._isEnabled() && this._transport ? this._transport.send(envelope).then(null, reason => (t && u.error("Error while sending envelope:", reason), reason)) : (t && u.error("Transport disabled"), resolvedSyncPromise({}));
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
      (sessionNonTerminal && 0 === session.errors || sessionNonTerminal && crashed) && (te(session, {
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
    _prepareEvent(event, hint, currentScope, isolationScope = ge()) {
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
          "log" === sentryError.logLevel ? u.log(sentryError.message) : u.warn(sentryError);
        }
      });
    }
    _processEvent(event, hint, currentScope) {
      const options = this.getOptions(),
        {
          sampleRate: sampleRate
        } = options,
        isTransaction = isTransactionEvent(event),
        isError = Bn(event),
        eventType = event.type || "error",
        beforeSendLabel = `before send for type \`${eventType}\``,
        parsedSampleRate = void 0 === sampleRate ? void 0 : function (sampleRate) {
          if ("boolean" == typeof sampleRate) return Number(sampleRate);
          const rate = "string" == typeof sampleRate ? parseFloat(sampleRate) : sampleRate;
          if (!("number" != typeof rate || isNaN(rate) || rate < 0 || rate > 1)) return rate;
          t && u.warn(`[Tracing] Given sample rate is invalid. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(sampleRate)} of type ${JSON.stringify(typeof sampleRate)}.`);
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
          if (Bn(event) && beforeSend) return beforeSend(event, hint);
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
          if (S(beforeSendResult)) return beforeSendResult.then(event => {
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
      t && u.log("Flushing outcomes...");
      const outcomes = this._clearOutcomes();
      if (0 === outcomes.length) return void (t && u.log("No outcomes to send"));
      if (!this._dsn) return void (t && u.log("No dsn provided, will not send outcomes"));
      t && u.log("Sending outcomes:", outcomes);
      const envelope = (discarded_events = outcomes, yn((dsn = this._options.tunnel && gn(this._dsn)) ? {
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
  function Bn(event) {
    return void 0 === event.type;
  }
  function isTransactionEvent(event) {
    return "transaction" === event.type;
  }
  class Gn extends BaseClient {
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
      }(opts, "browser", ["browser"], Nt.SENTRY_SDK_SOURCE || "npm"), super(opts), opts.sendClientReports && Nt.document && Nt.document.addEventListener("visibilitychange", () => {
        "hidden" === Nt.document.visibilityState && this._flushOutcomes();
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
      if (!this._isEnabled()) return void (st && u.warn("SDK not enabled, will not capture user feedback."));
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
              dsn: gn(dsn)
            })
          },
          item = function (feedback) {
            return [{
              type: "user_report"
            }, feedback];
          }(feedback);
        return yn(headers, [item]);
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
  var PlatformKey, CachedStorageIds, UpdaterConstants, ActivityReportingConstants, DMSManagerConstants, FzboxConstants, KeepAliveConstants, FilterMethod, FilteringConstants, FallbackVerdictStoreConstants, VerdictStoreConstants, YouTubeVerdictStoreConstants, ConfigConstants, FeatureFlags, ChatConstants, ConfigFetcherConstants, TabsConstants, MainConstants, CompanionConstants, SystemConfigConstants, DelegationConstants, BrowserConstants, DelegationReporting, ContentAwareConstants, ContentAwareCategories, ContentAwareIECMessageTypes, ContentAwareLicenseStatus, AuthenticateConstants, AttestationConstants, ConnectionsConstants, ScreenshotPersisterConstants, SchedulesConstants, UniqueScheduleIds, EventTypes, LogLevelTypes, LogLevel, MessageTypes, CompanionFeatures, BrowserTypes;
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
  }(EventTypes || (EventTypes = {})), function (LogLevelTypes) {
    LogLevelTypes.Error = "logging__error", LogLevelTypes.Warning = "logging__warning", LogLevelTypes.Message = "logging__message", LogLevelTypes.Debug = "logging__debug";
  }(LogLevelTypes || (LogLevelTypes = {})), function (LogLevel) {
    LogLevel.INFO = "INFO", LogLevel.WARN = "WARN", LogLevel.ERROR = "ERROR", LogLevel.DEBUG = "DEBUG";
  }(LogLevel || (LogLevel = {})), function (MessageTypes) {
    MessageTypes.InitOffscreenDocument = "init_offscreen_socument_message", MessageTypes.RegisterClasswizeEventFail = "register_extension_with_native_agent_classwize_events_fail", MessageTypes.RegisterClasswizeEventMessage = "register_extension_with_native_agent_classwize_events_Message", MessageTypes.IsExtensionRegistered = "is_extension_registered_with_native_agent", MessageTypes.CompanionMessage = "message_from_native_agent", MessageTypes.RecoverCompanionStream = "recover_companion_stream", MessageTypes.RetryRegistration = "retry_registration_with_native_agent", MessageTypes.SetUpIpAddressChangeDetection = "ip_address_change_detection", MessageTypes.TabsActivated = "tabs_activated_message", MessageTypes.P2PInitSignaler = "p2p_init_signaler_message", MessageTypes.P2PSetCloseTimeouts = "p2p_set_close_timeouts_message", MessageTypes.P2PGetScreenshot = "p2p_get_screenshot_message", MessageTypes.P2PGetTabs = "p2p_get_tabs_message", MessageTypes.UtilLocalIpUpdated = "util_local_ip_updated_message", MessageTypes.UtilResizeAndCompressImage = "util_resize_and_compress_image", MessageTypes.UtilCompositeImagesHorizontally = "util_composite_images_horizontally", MessageTypes.BroadcastWakeUpCall = "cachescheduler_broadcast_wakeup_call", MessageTypes.BroadcastScheduleTime = "schedule-time-ee236fce-1426-4975-9d56-2ce4e8becd02", MessageTypes.ChatBubbleStatus = "chat_status", MessageTypes.ChatInfo = "chat_info", MessageTypes.ChatGetLastMessage = "last_chat_message", MessageTypes.ChatClearLastMessage = "clear_last_chat_message", MessageTypes.UIGetStatus = "ui_get_status", MessageTypes.UIReloadConfig = "ui_reload_config", MessageTypes.UISendLogs = "ui_send_logs", MessageTypes.UserOverride = "user_override", MessageTypes.UpdaterNewMessage = "updater_new_message", MessageTypes.GetSafeguardVerdict = "get_safe_guard_verdict", MessageTypes.RedirectWebPage = "redirect_web_page", MessageTypes.EventMessage = "event_service_message", MessageTypes.InitAutoAuth = "init_auto_auth", MessageTypes.GetAuthCookie = "get_auth_cookie", MessageTypes.GetAuthToken = "get_auth_token", MessageTypes.GetAttestationToken = "get_attestation_token", MessageTypes.UploadLogData = "upload_log_data", MessageTypes.UpdateOffscreenConfig = "update_offscreen_config", MessageTypes.MainConfigUpdated = "main_config_updated", MessageTypes.OffScreenLogMessage = "Off_screen_log_message", MessageTypes.Token = "TOKEN", MessageTypes.ChatConfigUpdate = "CHAT_CONFIG_UPDATE", MessageTypes.UpdateTotalUnreadCount = "UPDATE_TOTAL_UNREAD_COUNT", MessageTypes.OpenChatClassroom = "OPEN_CHAT_CLASSROOM", MessageTypes.GoogleAuthenticate = "GOOGLE_AUTHENTICATE", MessageTypes.NativeTokenAuthenticate = "NATIVE_TOKEN_AUTHENTICATE", MessageTypes.GetBrowserType = "get_browser_type", MessageTypes.GetBrowserDetails = "get_browser_details", MessageTypes.CheckIfDomainIsBlocked = "check_if_domain_is_blocked", MessageTypes.ExtractFallbackDomains = "extract_fallback_domains", MessageTypes.LogMessage = "log_message", MessageTypes.InitOffscreenOpenTelemetry = "init-offscreen-opentelemetry", MessageTypes.SentryGetUserDetails = "sentry-get-user-details", MessageTypes.ChatLogMessage = "chat-log-message", MessageTypes.ReloadPopUp = "reload-popup", MessageTypes.PopupIsReloading = "popup-is-reloading", MessageTypes.PopupIsNotReloading = "popup-is-not-reloading", MessageTypes.ProxiedFetch = "proxied_fetch", MessageTypes.TabVerdictUpdated = "tab_verdict_updated", MessageTypes.GetCompanionConnectionInfo = "get_companion_connection_info_message", MessageTypes.UpdateCompanionStatus = "update_companion_status", MessageTypes.UnenrollCompanionMessage = "unenroll_companion_message", MessageTypes.RequestConfigUpdate = "request_config_update", MessageTypes.InternetBackOnline = "internet_back_online", MessageTypes.EmbeddedYoutubeVideoVerdict = "embedded_youtube_video_verdict";
  }(MessageTypes || (MessageTypes = {})), function (CompanionFeatures) {
    CompanionFeatures.companion = "companion", CompanionFeatures.companionLite = "companion_lite", CompanionFeatures.proxyFilter = "proxy_filter", CompanionFeatures.dns_filter = "dns_filter", CompanionFeatures.classroom = "classroom", CompanionFeatures.liteModeEnabled = "companion-mode-lite-enabled";
  }(CompanionFeatures || (CompanionFeatures = {})), function (BrowserTypes) {
    BrowserTypes.chrome = "chrome", BrowserTypes.edge = "edge";
  }(BrowserTypes || (BrowserTypes = {}));
  const isGetSafeguardVerdictMsg = checkMessageType(MessageTypes.GetSafeguardVerdict),
    isProxiedFetchMsg = checkMessageType(MessageTypes.ProxiedFetch);
  const sharedSentryConfig = {
    dsn: "https://c17cd3300c4e109ad958146b698040aa@o4507960794546176.ingest.us.sentry.io/4507960797102080",
    tracesSampleRate: 1,
    sampleRate: 1,
    ignoreErrors: ["Could not establish connection. Receiving end does not exist.", /^Cannot access contents of url/i, /message channel closed before a response was received/i]
  };
  let localSentryScope;
  var ContentScriptMessageType;
  !function (ContentScriptMessageType) {
    ContentScriptMessageType.ASYNC_VERDICT = "ASYNC_VERDICT", ContentScriptMessageType.CHECK_INTERNET_CONNECTION = "CHECK_INTERNET_CONNECTION", ContentScriptMessageType.CHECK_DISABLE_CONTENT_SCRIPT = "CHECK_DISABLE_CONTENT_SCRIPT", ContentScriptMessageType.VISIBILITY_CHANGE = "VISIBILITY_CHANGE";
  }(ContentScriptMessageType || (ContentScriptMessageType = {}));
  class ContentMods {
    static handleContentMod(content_mod) {
      switch (content_mod.action) {
        case "remove":
          this.hideDomBySelector(content_mod.target);
          break;
        case "replace":
          this.replaceDomBySelector(content_mod.target, content_mod.value);
          break;
        default:
          console.warn(`[ContentMods] Unknown action: ${content_mod.action}`);
      }
    }
    static hideDomBySelector(selector) {
      try {
        const cssStyleText = selector + " {display: none !important;}",
          styleElement = document.createElement("style");
        if (styleElement.type = "text/css", styleElement.styleSheet) styleElement.styleSheet.cssText = cssStyleText;else {
          const cssTextNode = document.createTextNode(cssStyleText);
          styleElement.appendChild(cssTextNode);
        }
        const headElements = document.getElementsByTagName("head");
        if (headElements.length > 0) headElements[0].appendChild(styleElement);else {
          console.warn('document error: missing the "head" element');
          const headElement = document.createElement("head");
          headElement.appendChild(styleElement);
          const htmlElements = document.getElementsByTagName("html");
          if (htmlElements.length <= 0) return void console.error('document error: missing the "html" element');
          htmlElements[0].appendChild(headElement);
        }
        console.log(`Succeeded in removing the selector '${selector}'`);
      } catch (e) {
        console.warn(`Failed to remove the selector '${selector}':`, e);
      }
    }
    static replaceDomBySelector(selector, value) {
      try {
        const doms = document.querySelectorAll(selector);
        for (let i = 0; i < doms.length; ++i) doms[i].innerText = value;
        console.log(`Succeeded in replacing ${doms.length} DOM elements to '${value}' with the selector '${selector}`);
      } catch (e) {
        console.warn(`Failed to replace the selector '${selector}':`, e);
      }
    }
  }
  var Mr = function (e, t, n, r) {
    return new (n || (n = Promise))(function (o, s) {
      function i(e) {
        try {
          c(r.next(e));
        } catch (e) {
          s(e);
        }
      }
      function a(e) {
        try {
          c(r.throw(e));
        } catch (e) {
          s(e);
        }
      }
      function c(e) {
        var t;
        e.done ? o(e.value) : (t = e.value, t instanceof n ? t : new n(function (e) {
          e(t);
        })).then(i, a);
      }
      c((r = r.apply(e, t || [])).next());
    });
  };
  const Ur = new class {
    constructor() {
      this.maxPageHideAttempts = 5, this.documentHiderId = "linewize-protect", this.blockCounter = 0;
    }
    tryHidingPage() {
      return Mr(this, void 0, void 0, function* () {
        return new Promise(resolve => {
          window.requestAnimationFrame(() => Mr(this, void 0, void 0, function* () {
            try {
              yield this.hidePage.bind(this)(), resolve();
            } catch (e) {
              yield this.tryHidingPage.bind(this)(), resolve();
            }
          }));
        });
      });
    }
    hidePage() {
      return Mr(this, void 0, void 0, function* () {
        return new Promise(resolve => {
          if (this.blockCounter += 1, this.blockCounter <= this.maxPageHideAttempts && !this.checkHiderIsStillPresent()) {
            console.log("Hiding page content");
            const style = document.createElement("style");
            style.textContent = "\n                    @media print {\n                        #linewize-protect {\n                            display: none !important;\n                        }\n                    }", document.documentElement.appendChild(style), this.documentHider = document.createElement("div"), this.documentHider.style.position = "fixed", this.documentHider.style.width = "100%", this.documentHider.style.height = "100%", this.documentHider.style.zIndex = "2147483647", this.documentHider.style.background = "rgba(255,255,255,1)", this.documentHider.style.display = "block", this.documentHider.style.left = "0", this.documentHider.style.top = "0", this.documentHider.id = this.documentHiderId, document.body.appendChild(this.documentHider), console.log("Successfully hid page content");
          } else console.log("Hiding page content failed after the max page hide attemps");
          resolve();
        });
      });
    }
    unHidePage() {
      console.log("Displaying page again");
      try {
        this.checkHiderIsStillPresent() && (this.documentHider.remove(), document.querySelectorAll(`[id=${this.documentHiderId}]`).forEach(x => x.remove()));
      } catch (exc) {
        console.log("Failed to un-hide document", exc);
        try {
          document.getElementById(this.documentHiderId).remove();
        } catch (e) {
          console.log("Failed to find element in document", e);
        }
      }
    }
    checkHiderIsStillPresent() {
      return !!(this.documentHider && this.documentHider.parentNode || document.getElementById(this.documentHiderId));
    }
  }();
  class FallbackFilter {
    static checkPage() {
      return this.checkTitle() || this.checkContent();
    }
    static checkTitle() {
      return document.title.length > 0 && this.titleRegex.test(document.title);
    }
    static checkContent() {
      const thisHeading = document.evaluate(this.contentQuery, document, null, XPathResult.ANY_TYPE, null).iterateNext();
      if (thisHeading && thisHeading.textContent) {
        const textContent = thisHeading.textContent.toLowerCase();
        for (const keyword of this.contentKeywords) if (-1 !== textContent.indexOf(keyword)) return !0;
      }
      return !1;
    }
  }
  FallbackFilter.titleRegex = new RegExp("porn", "i"), FallbackFilter.contentQuery = "//body[contains(., 'age-restricted') or contains(., 'Warning: This Site Contains Sexually Explicit Content') or contains(., ' contains adult material') or contains(., 'website contains adult material') or contains(., 'ADULTS ONLY DISCLAIMER') or contains(., 'Warning: You must be 18 years or older') or contains(., 'adult-only') or contains(., 'porn') or contains(., 'fuck')]", FallbackFilter.contentKeywords = ["porn", "sex", "adult"];
  const Fr = FallbackFilter;
  var Hr = function (e, t, n, r) {
    return new (n || (n = Promise))(function (o, s) {
      function i(e) {
        try {
          c(r.next(e));
        } catch (e) {
          s(e);
        }
      }
      function a(e) {
        try {
          c(r.throw(e));
        } catch (e) {
          s(e);
        }
      }
      function c(e) {
        var t;
        e.done ? o(e.value) : (t = e.value, t instanceof n ? t : new n(function (e) {
          e(t);
        })).then(i, a);
      }
      c((r = r.apply(e, t || [])).next());
    });
  };
  (extensionDetails => {
    const releaseName = (extensionDetails => {
        var t;
        if (!(extensionDetails && extensionDetails.extensionVersion && extensionDetails.extensionName && extensionDetails.buildENV)) return;
        const lastVersionNumber = null == extensionDetails ? void 0 : extensionDetails.extensionVersion,
          productName = null === (t = null == extensionDetails ? void 0 : extensionDetails.extensionName) || void 0 === t ? void 0 : t.toLowerCase().replace(/ /g, "-");
        let buildType = "prod";
        return "development" === (null == extensionDetails ? void 0 : extensionDetails.buildENV) && (buildType = "local-dev"), `${productName}.${buildType}@${lastVersionNumber}`;
      })(extensionDetails),
      integrations = [inboundFiltersIntegration(), functionToStringIntegration(), browserApiErrorsIntegration(), breadcrumbsIntegration(), globalHandlersIntegration(), linkedErrorsIntegration(), dedupeIntegration(), {
        name: "HttpContext",
        preprocessEvent(event) {
          if (!Nt.navigator && !Nt.location && !Nt.document) return;
          const url = event.request && event.request.url || Nt.location && Nt.location.href,
            {
              referrer: referrer
            } = Nt.document || {},
            {
              userAgent: userAgent
            } = Nt.navigator || {},
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
      }].filter(defaultIntegration => !["BrowserApiErrors", "Breadcrumbs", "GlobalHandlers"].includes(defaultIntegration.name)),
      additionalConfig = {
        transport: Pn,
        stackParser: Mn,
        integrations: integrations,
        release: releaseName
      },
      client = new Gn(Object.assign(Object.assign({}, sharedSentryConfig), additionalConfig));
    localSentryScope = new Scope(), localSentryScope.setClient(client), client.init();
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
    var e, t, n, r;
    e = this, t = void 0, r = function* () {
      chrome.runtime.sendMessage({
        type: MessageTypes.SentryGetUserDetails
      }, response => {
        var details, value, user;
        response && (details = response).userIdentifier && details.applianceId && (localSentryScope ? (localSentryScope.setUser({
          id: details.userIdentifier
        }), localSentryScope.setTag("applianceId", details.applianceId)) : (user = {
          id: details.userIdentifier
        }, ge().setUser(user), value = details.applianceId, ge().setTag("applianceId", value)));
      });
    }, new ((n = void 0) || (n = Promise))(function (o, s) {
      function i(e) {
        try {
          c(r.next(e));
        } catch (e) {
          s(e);
        }
      }
      function a(e) {
        try {
          c(r.throw(e));
        } catch (e) {
          s(e);
        }
      }
      function c(e) {
        var t;
        e.done ? o(e.value) : (t = e.value, t instanceof n ? t : new n(function (e) {
          e(t);
        })).then(i, a);
      }
      c((r = r.apply(e, t || [])).next());
    });
  }(), window.addEventListener("error", function (ev) {
    ev.error && (filename => {
      const prefix = `chrome-extension://${chrome.runtime.id}/`;
      return filename.includes(prefix);
    })(ev.filename) && ev.error;
  }), new class {
    constructor() {
      this.currentUrl = window.location.href, this.connectedToInternet = void 0, this.whitePageRemoveMs = 5500;
    }
    init() {
      return Hr(this, void 0, void 0, function* () {
        if (yield this.sendRuntimeMessage({
          type: ContentScriptMessageType.CHECK_DISABLE_CONTENT_SCRIPT,
          url: window.location.href
        })) return void console.log("Content script not allowed on this website, ContentFilter is skipped...");
        console.log("Hiding page and executing checks to ensure it is safe to show"), yield Ur.tryHidingPage(), chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
          var msg;
          if (!("object" != typeof (msg = message) || null == msg || "module" in msg && void 0 !== msg.module) && "type" in msg && "string" == typeof msg.type) if (message.type !== MessageTypes.EmbeddedYoutubeVideoVerdict) {
            if (message.type !== MessageTypes.TabsActivated) {
              if (isProxiedFetchMsg(message)) return this.handleProxiedFetch(message.url, message.options).then(response => {
                sendResponse(response);
              }).catch(error => {
                console.error("Error in proxied fetch:", error), sendResponse({
                  ok: !1,
                  status: 0,
                  statusText: error.message || "Fetch failed",
                  json: void 0
                });
              }), !0;
              if (isGetSafeguardVerdictMsg(message)) {
                const isTopWindow = window.top == window.self;
                return this.documentLoadFallbackCheck().then(safeguardVerdict => Hr(this, void 0, void 0, function* () {
                  isTopWindow && (safeguardVerdict || (void 0 === this.connectedToInternet && (this.connectedToInternet = yield this.sendRuntimeMessage({
                    type: ContentScriptMessageType.CHECK_INTERNET_CONNECTION
                  })), safeguardVerdict = !this.connectedToInternet), sendResponse(safeguardVerdict ? EVerdictAction.ALLOW : EVerdictAction.BLOCK)), safeguardVerdict || this.redirectToBlockPage(message.blockPageUrl);
                })), isTopWindow;
              }
            } else this.getVerdictAndUnhide();
          } else {
            const result = message;
            result.verdict === EVerdictAction.BLOCK && this.removeYouTubeIframes(result.url);
          }
        });
        const getVerdictTimeout = setTimeout(() => {
          this.getVerdictAndUnhide(void 0, !0);
        }, 1e3);
        chrome.runtime.onMessage.addListener(message => {
          message.type === MessageTypes.TabVerdictUpdated && (clearTimeout(getVerdictTimeout), this.currentUrl = window.location.href, this.getVerdictAndUnhide(message.verdict, !0));
        }), window.addEventListener("online", () => {
          chrome.runtime.sendMessage({
            type: MessageTypes.InternetBackOnline
          });
        });
        const sendVisibilityState = () => this.sendRuntimeMessage({
          type: ContentScriptMessageType.VISIBILITY_CHANGE,
          value: document.visibilityState
        });
        document.addEventListener("visibilitychange", sendVisibilityState), sendVisibilityState();
      });
    }
    redirectToBlockPage(blockPageUrl) {
      return Hr(this, void 0, void 0, function* () {
        setTimeout(() => {
          console.warn("Fallback check failed, redirecting to block page"), window.location.href = blockPageUrl;
        }, 500);
      });
    }
    sendRuntimeMessage(request) {
      return Hr(this, void 0, void 0, function* () {
        return new Promise(resolve => {
          chrome.runtime.sendMessage(request, response => {
            resolve(response);
          });
        });
      });
    }
    getVerdictAndUnhide(e) {
      return Hr(this, arguments, void 0, function* (verdict, bypassCheckHider = !1) {
        if (bypassCheckHider || Ur.checkHiderIsStillPresent()) {
          console.log("Requesting verdict for this page");
          const unhideWhitePageTimeout = setTimeout(() => {
            this.documentLoadFallbackCheck().then(safeguardVerdict => {
              safeguardVerdict && Ur.unHidePage();
            });
          }, this.whitePageRemoveMs);
          if (this.verdict = verdict || (yield this.sendRuntimeMessage({
            type: ContentScriptMessageType.ASYNC_VERDICT,
            url: this.currentUrl
          })), clearTimeout(unhideWhitePageTimeout), console.log("Verdict received:", this.verdict), !(yield this.checkRequest())) return;
          console.log("Page checks passed, showing page again"), Ur.unHidePage();
        }
      });
    }
    checkRequest() {
      return Hr(this, void 0, void 0, function* () {
        if (!this.verdict) return !0;
        if (this.verdict.redirect_uri) return window.location.href = this.verdict.redirect_uri, !1;
        if (this.verdict.verdict === EVerdictAction.BLOCK) return !1;
        if (this.verdict.content_mod) {
          console.log("Verdict contains content modifications, applying them");
          for (const contentMod of this.verdict.content_mod) ContentMods.handleContentMod(contentMod);
        }
        return console.log("Verdict checks passed"), !0;
      });
    }
    documentLoadFallbackCheck() {
      return Hr(this, void 0, void 0, function* () {
        return new Promise(resolve => {
          "interactive" === document.readyState || "complete" === document.readyState ? resolve(this.runFallbackChecks()) : document.addEventListener("DOMContentLoaded", () => {
            resolve(this.runFallbackChecks());
          }, !0);
        });
      });
    }
    runFallbackChecks() {
      return Hr(this, void 0, void 0, function* () {
        return console.log("Checking page against fallback filter to ensure CIPA compliance"), !Fr.checkPage() && (console.log("Fallback check passed"), !0);
      });
    }
    handleProxiedFetch(url, options) {
      return Hr(this, void 0, void 0, function* () {
        try {
          const response = yield fetch(url, {
            method: options.method,
            headers: options.headers,
            body: options.body
          });
          let json;
          try {
            json = yield response.json();
          } catch (e) {
            console.error("Failed to parse response as JSON:", e), json = void 0;
          }
          return {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            json: json
          };
        } catch (error) {
          throw console.error("Proxied fetch error:", error), error;
        }
      });
    }
    removeYouTubeIframes(url) {
      document.querySelectorAll("iframe").forEach(iframe => {
        const src = iframe.src || iframe.getAttribute("src") || "";
        src === url && (console.log("Removing YouTube iframe:", src), iframe.remove());
      });
    }
  }().init().catch(err => {
    console.error("Failed to filter page, hiding it permanently to protect the student", err), Ur.tryHidingPage();
  });
})();
//# sourceMappingURL=filter.bundle.js.map