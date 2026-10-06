# Linewize Connect 4.0.4 - readable source

Reconstructed from `c00lkiddtech/linewize-dump` (extension id
`ifinpabiejbjobcphhaomiifjibpkjlf`, "Linewize Connect" by Qoria).

## This is different from the Lightspeed job

The Lightspeed files were deliberately obfuscated. These are **not**. They are
ordinary webpack bundles, minified for release, and every bundle ships its
source map (`.js.map`). That changes the best approach:

- There were no string tables or control-flow tricks to undo.
- The source maps record the original file paths and, at thousands of points,
  the original identifier names the developers used.

So instead of guessing names, this recovers the real ones.

## What was done

1. **Readable bundles.** For each bundle, a source-map-aware pass walked the
   code and renamed every minified identifier (`e`, `t`, `n`, ...) back to the
   original name the map records at that location. Already-readable names were
   left alone. Renames are scope-checked so behavior is unchanged, and every
   file passes `node --check`. These live in the extension's own folder layout
   (`background/`, `content_scripts/`, `offscreen/`, etc.).
2. **Original source trees.** `_original_source_trees/` lists, per bundle, every
   original source path the map references, split into first-party
   (`src/...`) and libraries. This is the real project structure the extension
   was built from.
3. **Recovered original source.** `_recovered_original_source/` holds any file
   whose complete original text was embedded in a map. Only
   `activity_debug/main.ts` had its content included; it is byte-for-byte the
   developers' TypeScript.

## Why not one .ts file per module?

The maps give original paths and names but not the full original text (except
the one file above). The bundles could be split by module, but webpack reflows
the code, so a clean per-file `.ts` tree can't be rebuilt faithfully. The
readable bundle plus the exact source-path list is the honest, complete result.

## The extension, from the recovered structure

Manifest highlights: Manifest V3, background service worker, three content
scripts (`filter`, `categoriser`, `notifications`), an offscreen document, and
permissions including `webRequest`, `webRequestBlocking`, `cookies`,
`management`, `enterprise.deviceAttributes` and `identity`. Updates come from
`download.qoria.com`.

What the pieces do, by bundle:

- **`background/background.js`** is the core. The source tree shows Firebase
  auth and Firestore APIs, OpenTelemetry tracing, a Dexie IndexedDB cache,
  protobuf reporting models (`proto.reporting.models.*`,
  `InitP2PEvent`), a delegation controller, and the filtering/verdict logic.
  It logs in, fetches policy, returns a verdict per request (`sendVerdict`),
  and reports activity. Endpoints include `*.linewize.net`
  (`chromelogin`, `whoami`), `login.*`, `mylinewize.*`, `configuration-gw.*`
  and `stats-xlb.*`.
- **`content_scripts/filter.js`** applies the verdict in the page: hides or
  blocks content, injects the block page, with a fallback path. It also
  bundles Sentry (`isError`, integration setup) for error reporting.
- **`content_scripts/categoriser.js`** classifies the current page.
- **`content_scripts/notifications.js`** shows in-page notifications.
- **`offscreen/offscreen.js`** is an offscreen document; its tree is dominated
  by OpenTelemetry and platform shims used for background work the service
  worker can't do directly.
- **`chat/chat.js`** and **`chat/assets/scripts/bubble.js`** are the student
  chat feature (the "beta" chat bubble), with Sentry instrumentation.
- **`popup/popup.js`** and **`options/popup.js`** are the toolbar popup and
  options page (login, policy and settings views).
- **`activity_debug/main.js`** is an internal debug viewer for the raw activity
  log. Its exact `.ts` is in `_recovered_original_source/`.
- **`background/assets/scripts/*`** are small injected helpers for the block /
  close-tab messages and CSS injection.

## Where names could not be recovered

A minority of identifiers had no name in the map (counted as "skipped" during
processing). Those keep their short minified form. They are a small fraction of
each file.
