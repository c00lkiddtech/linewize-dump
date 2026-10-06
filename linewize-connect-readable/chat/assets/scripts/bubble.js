(() => {
  "use strict";

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
  }(BrowserTypes || (BrowserTypes = {})), checkMessageType(MessageTypes.GetSafeguardVerdict), checkMessageType(MessageTypes.ProxiedFetch);
  var G = function (e, t, n, a) {
    return new (n || (n = Promise))(function (i, o) {
      function s(e) {
        try {
          _(a.next(e));
        } catch (e) {
          o(e);
        }
      }
      function c(e) {
        try {
          _(a.throw(e));
        } catch (e) {
          o(e);
        }
      }
      function _(e) {
        var t;
        e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n(function (e) {
          e(t);
        })).then(s, c);
      }
      _((a = a.apply(e, t || [])).next());
    });
  };
  class ChatBubble {
    static init() {
      return G(this, void 0, void 0, function* () {
        (yield ChatBubble.sendRuntimeMessage({
          type: MessageTypes.ChatBubbleStatus
        })) ? this.createChatBubble() : this.removeChatBubble();
      });
    }
    static sendRuntimeMessage(request) {
      return G(this, void 0, void 0, function* () {
        return new Promise(resolve => {
          chrome.runtime.sendMessage(request, response => {
            resolve(response);
          });
        });
      });
    }
    static createChatBubble() {
      let chatIcon = document.getElementById("bubbleId");
      if (chatIcon) {
        let notificationBubble = document.getElementById("msgCountId");
        notificationBubble || (notificationBubble = document.createElement("div"), notificationBubble.id = "msgCountId", notificationBubble.style.height = "24px", notificationBubble.style.width = "24px", notificationBubble.style.borderRadius = "50%", notificationBubble.style.backgroundColor = "#DF2935", notificationBubble.style.position = "absolute", notificationBubble.style.zIndex = String(Number.MAX_SAFE_INTEGER), notificationBubble.style.top = "-6.67%", notificationBubble.style.left = "66.67%", notificationBubble.style.alignItems = "center", notificationBubble.style.justifyContent = "center", notificationBubble.style.display = "flex", notificationBubble.style.color = "white", notificationBubble.style.fontSize = "12px", notificationBubble.style.fontWeight = "bold", chatIcon.appendChild(notificationBubble)), window.lwChatMsgCount ? (notificationBubble.innerText = window.lwChatMsgCount > 9 ? "9+" : window.lwChatMsgCount.toString(), notificationBubble.style.visibility = "visible") : notificationBubble.style.visibility = "hidden", window.lwChatImageLeft && (chatIcon.style.left = window.lwChatImageLeft + "px"), window.lwChatImageTop && (chatIcon.style.top = window.lwChatImageTop + "px");
      } else {
        let pos1 = 0,
          pos2 = 0,
          pos3 = 0,
          pos4 = 0,
          isDragging = !1;
        chatIcon = document.createElement("div"), chatIcon.id = "bubbleId", chatIcon.style.height = "60px", chatIcon.style.width = "60px", chatIcon.style.position = "fixed", chatIcon.style.right = String(0), chatIcon.style.bottom = String(0), chatIcon.style.zIndex = String(Number.MAX_SAFE_INTEGER - 1);
        const chatImage = document.createElement("img");
        chatImage.style.width = "60px", chatImage.style.height = "60px", chatImage.style.borderRadius = "50%", chatImage.style.boxShadow = "0 10px 20px 5px rgba(0, 0, 0, 0.1)", chatImage.src = chrome.runtime.getURL("/chat/assets/imgs/bubble.svg"), chatIcon.appendChild(chatImage), chatIcon.addEventListener("click", () => {
          isDragging ? isDragging = !1 : ChatBubble.sendRuntimeMessage({
            type: "SHOW_CHAT_UI"
          });
        }), (element => {
          chatIcon.onmousedown = e => {
            (e = e || window.event).preventDefault(), pos3 = e.clientX, pos4 = e.clientY, document.onmouseup = closeDragElement, document.onmousemove = elementDrag;
          };
          const elementDrag = e => {
            (e = e || window.event).preventDefault(), pos1 = pos3 - e.clientX, pos2 = pos4 - e.clientY, pos3 = e.clientX, pos4 = e.clientY;
            const newTop = element.offsetTop - pos2,
              newLeft = element.offsetLeft - pos1;
            newTop < 0 || newTop + 60 > window.innerHeight || newLeft < 0 || newLeft + 60 > window.innerWidth || (element.style.top = newTop + "px", element.style.left = newLeft + "px", isDragging = !0);
          };
          function closeDragElement() {
            document.onmouseup = null, document.onmousemove = null, ChatBubble.sendRuntimeMessage({
              type: "UPDATE_CHAT_BUBBLE_POSITION",
              imageLeft: chatIcon.offsetLeft - pos2,
              imageTop: chatIcon.offsetTop - pos2
            });
          }
        })(chatIcon), document.body.appendChild(chatIcon);
      }
    }
    static removeChatBubble() {
      ChatBubble.sendRuntimeMessage({
        type: "CLOSE_CHAT_UI"
      });
      const chatIcon = document.getElementById("bubbleId");
      if (chatIcon) return chatIcon.parentNode.removeChild(chatIcon);
    }
  }
  ChatBubble.init();
})();
//# sourceMappingURL=bubble.bundle.js.map