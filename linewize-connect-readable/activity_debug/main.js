(() => {
  "use strict";

  var e = function (e, t, n, o) {
    return new (n || (n = Promise))(function (r, d) {
      function c(e) {
        try {
          s(o.next(e));
        } catch (e) {
          d(e);
        }
      }
      function l(e) {
        try {
          s(o.throw(e));
        } catch (e) {
          d(e);
        }
      }
      function s(e) {
        var t;
        e.done ? r(e.value) : (t = e.value, t instanceof n ? t : new n(function (e) {
          e(t);
        })).then(c, l);
      }
      s((o = o.apply(e, t || [])).next());
    });
  };
  const STORE_NAME = "raw_activity_data",
    TYPE_MAP = {
      "user-identity": "Context",
      "client-identity": "Context",
      "client-state": "Context",
      "web-request": "Request",
      "document-open": "Open",
      "document-update": "Update",
      "document-close": "Close"
    },
    UPDATE_PROPS = ["title", "isActive", "isVisible", "isFocused", "isAudible", "idleState", "blocked"],
    checkedTypes = new Set(["document-open", "document-update", "document-close"]),
    checkedUpdateProps = new Set(UPDATE_PROPS);
  let filteredDocumentId = null,
    includeChromeExtensionPages = !1;
  function getUpdateFlags(record) {
    var t;
    const blocked = null === (t = record.data.policyResult) || void 0 === t ? void 0 : t.isBlocked;
    return Object.assign(Object.assign({}, record.data), {
      blocked: blocked
    });
  }
  function shouldShowRecord(record, excludedDocs) {
    const id = extractActivityId(record);
    if (id && excludedDocs.has(id)) return !1;
    if (null !== filteredDocumentId && extractActivityId(record) !== filteredDocumentId) return !1;
    if (!checkedTypes.has(record.type)) return !1;
    const {
      from: from,
      to: to
    } = function () {
      const fromVal = document.getElementById("date-from").value,
        toVal = document.getElementById("date-to").value;
      return {
        from: fromVal ? new Date(fromVal).getTime() : 0,
        to: toVal ? new Date(toVal).getTime() + 864e5 : 1 / 0
      };
    }();
    if (record.ts < from || record.ts >= to) return !1;
    if ("document-update" === record.type) {
      if (0 === checkedUpdateProps.size) return !1;
      const data = getUpdateFlags(record);
      return UPDATE_PROPS.some(p => checkedUpdateProps.has(p) && void 0 !== data[p]);
    }
    return !0;
  }
  function getLastKey(db) {
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).openCursor(null, "prev");
      req.onsuccess = () => {
        var e, t;
        return resolve(null !== (t = null === (e = req.result) || void 0 === e ? void 0 : e.key) && void 0 !== t ? t : null);
      }, req.onerror = () => reject(req.error);
    });
  }
  function formatTs(ts) {
    return new Date(ts).toLocaleTimeString();
  }
  function renderUpdateCells(record) {
    if ("document-update" !== record.type) return UPDATE_PROPS.map(() => "<td></td>").join("");
    const data = getUpdateFlags(record);
    return UPDATE_PROPS.map(prop => {
      const val = data[prop];
      return null == val ? "<td></td>" : "idleState" === prop ? `<td>${function (val) {
        return `<span class="prop prop-${val}">${val}</span>`;
      }(val)}</td>` : "title" === prop ? `<td>${String(val)}</td>` : `<td>${function (val) {
        return `<span class="prop prop-${val}">${val}</span>`;
      }(val)}</td>`;
    }).join("");
  }
  function extractActivityId(record) {
    switch (record.type) {
      case "web-request":
      case "document-open":
      case "document-update":
        return record.data.id.toString();
      case "document-close":
        return record.data.toString();
      default:
        return "";
    }
  }
  const PALETTE = Array.from({
    length: 32
  }, (_, i) => {
    const light = i % 2 == 0;
    return {
      bg: `hsl(${360 * i / 32 % 360}, 60%, ${light ? 75 : 40}%)`,
      text: light ? "#000000" : "#ffffff"
    };
  });
  function renderId(id) {
    const {
      bg: bg,
      text: text
    } = PALETTE[function (str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) hash = 31 * hash + str.charCodeAt(i) >>> 0;
      return hash;
    }(id) % 32];
    return `<span class="prop" style="background: ${bg}; color: ${text}">${id}</span>`;
  }
  function appendRows(records) {
    var t;
    const excludedDocs = new Set();
    if (!includeChromeExtensionPages) for (const record of allRecords) "document-open" === record.type && record.data.url.toString().startsWith("chrome-extension://") && excludedDocs.add(record.data.id.toString());
    const tbody = document.getElementById("table-body");
    let lastTimestamp;
    for (const record of records) {
      if (!shouldShowRecord(record, excludedDocs)) continue;
      if (lastTimestamp && record.virtualTs) {
        const elapsed = record.virtualTs - lastTimestamp;
        if (elapsed > 3e5) {
          const tr = document.createElement("tr"),
            td = document.createElement("td");
          td.colSpan = 11, td.style.textAlign = "center", td.style.color = "#bbb";
          const mins = Math.floor(elapsed / 6e4),
            secs = Math.floor(elapsed / 1e3) % 60;
          td.innerText = `(${mins}m ${secs}s)`, tr.appendChild(td), tbody.appendChild(tr);
        }
      }
      lastTimestamp = record.virtualTs;
      const tr = document.createElement("tr");
      tr.innerHTML = `\n            <td>\n                ${record.virtualTs ? formatTs(record.virtualTs) : ""}\n                \x3c!-- <br/><span class="faded">${formatTs(record.ts)}</span> --\x3e\n            </td>\n            <td>${renderId(extractActivityId(record))}</td>\n            <td style="white-space: nowrap;">${null !== (t = TYPE_MAP[record.type]) && void 0 !== t ? t : "UNKNOWN"}</td>\n            ${renderUpdateCells(record)}\n            <td>\n                <pre data-collapsible data-collapsed>${JSON.stringify(record.data, null, 2)}</pre>\n            </td>\n        `, tbody.appendChild(tr);
    }
  }
  function setStatus(msg) {
    document.getElementById("status").textContent = msg;
  }
  function setSuccessStatus(total) {
    setStatus(`Last updated: ${new Date().toLocaleTimeString()} — ${total} records total.`);
  }
  function setDocumentFilter(id) {
    filteredDocumentId = id;
    const row = document.getElementById("doc-filter-row"),
      label = document.getElementById("doc-filter-label");
    null !== id ? (label.innerHTML = renderId(id), row.style.display = "") : (row.style.display = "none", label.innerHTML = "");
  }
  function renderSummary(records) {
    const tbody = document.getElementById("summary-body");
    tbody.innerHTML = "";
    const summaries = function (records) {
        var t, n, o;
        const map = new Map(),
          get = id => (map.has(id) || map.set(id, {
            id: id,
            title: "",
            url: "",
            openTs: null,
            closeTs: null,
            lastUpdateTs: null,
            updateCount: 0,
            errors: []
          }), map.get(id));
        for (const record of records) {
          if ("web-request" === record.type) continue;
          const id = extractActivityId(record);
          if (!id) continue;
          const doc = get(id);
          "document-open" === record.type ? (null !== doc.openTs && doc.errors.push("Multiple open events"), doc.openTs = null !== (t = record.virtualTs) && void 0 !== t ? t : null, doc.url = record.data.url.toString()) : "document-update" === record.type ? (null === doc.openTs && doc.errors.push("Update before open"), doc.updateCount++, doc.lastUpdateTs = null !== (n = record.virtualTs) && void 0 !== n ? n : null, record.data.title && (doc.title = record.data.title)) : "document-close" === record.type && (null === doc.openTs && doc.errors.push("Close before open"), null !== doc.closeTs && doc.errors.push("Multiple close events"), doc.closeTs = null !== (o = record.virtualTs) && void 0 !== o ? o : null);
        }
        if (!includeChromeExtensionPages) for (const [id, doc] of map) doc.url.startsWith("chrome-extension://") && map.delete(id);
        return map;
      }(records),
      sorted = [...summaries.values()].sort((a, b) => {
        var n, o;
        return (null !== (n = a.openTs) && void 0 !== n ? n : 1 / 0) - (null !== (o = b.openTs) && void 0 !== o ? o : 1 / 0);
      });
    for (const doc of sorted) {
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer", doc.errors.length > 0 && (tr.style.background = "#fff3cd"), tr.innerHTML = `\n            <td>${renderId(doc.id)}</td>\n            <td>${doc.title}</td>\n            <td>${doc.url}</td>\n            <td>${doc.openTs ? formatTs(doc.openTs) : "—"}</td>\n            <td>${doc.lastUpdateTs ? formatTs(doc.lastUpdateTs) : "—"}</td>\n            <td>${doc.closeTs ? formatTs(doc.closeTs) : "—"}</td>\n            <td>${doc.updateCount}</td>\n            <td style="color: #a00">${doc.errors.join(", ") || ""}</td>\n        `, tr.addEventListener("click", () => {
        setDocumentFilter(doc.id), switchTab("raw"), rerender();
      }), tbody.appendChild(tr);
    }
  }
  let db,
    activeTab = "raw";
  function switchTab(tab) {
    activeTab = tab, document.getElementById("raw-table").style.display = "raw" === tab ? "" : "none", document.getElementById("summary-table").style.display = "summary" === tab ? "" : "none", document.getElementById("tab-events").classList.toggle("active", "raw" === tab), document.getElementById("tab-pages").classList.toggle("active", "summary" === tab), "summary" === tab && renderSummary(allRecords);
  }
  let lastKey = null,
    allRecords = [];
  function rerender() {
    document.getElementById("table-body").innerHTML = "", appendRows(allRecords), "summary" === activeTab && renderSummary(allRecords), setSuccessStatus(document.querySelector("tbody").rows.length);
  }
  function loadAll() {
    return e(this, void 0, void 0, function* () {
      setStatus("Loading..."), allRecords = yield function (db) {
        return new Promise((resolve, reject) => {
          const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
          req.onsuccess = () => resolve(req.result), req.onerror = () => reject(req.error);
        });
      }(db), lastKey = allRecords.length > 0 ? yield getLastKey(db) : null, rerender(), 0 === allRecords.length && setStatus("No records found.");
    });
  }
  function pollForNewRows() {
    return e(this, void 0, void 0, function* () {
      if (null === lastKey) return;
      const newRecords = yield function (db, lastKey) {
        return new Promise((resolve, reject) => {
          const range = IDBKeyRange.lowerBound(lastKey, !0),
            req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll(range);
          req.onsuccess = () => resolve(req.result), req.onerror = () => reject(req.error);
        });
      }(db, lastKey);
      newRecords.length > 0 && (allRecords.push(...newRecords), lastKey = yield getLastKey(db), appendRows(newRecords)), setSuccessStatus(document.querySelector("tbody").rows.length);
    });
  }
  (function () {
    return e(this, void 0, void 0, function* () {
      !function () {
        const container = document.getElementById("type-filters");
        {
          const el = document.createElement("label");
          el.innerHTML = '<input type="checkbox" id="type-context" /> Context', el.querySelector("input").addEventListener("change", e => {
            for (const key of ["user-identity", "client-identity", "client-state"]) e.target.checked ? checkedTypes.add(key) : checkedTypes.delete(key);
            rerender();
          }), container.appendChild(el);
        }
        for (const [key, label] of Object.entries(TYPE_MAP)) {
          if ("Context" === label) continue;
          const id = `type-${key}`,
            el = document.createElement("label"),
            checked = checkedTypes.has(key) ? "checked" : "";
          el.innerHTML = `<input type="checkbox" id="${id}" ${checked} /> ${label}`, el.querySelector("input").addEventListener("change", e => {
            e.target.checked ? checkedTypes.add(key) : checkedTypes.delete(key), rerender();
          }), container.appendChild(el);
        }
        {
          const el = document.createElement("label");
          el.innerHTML = '<input type="checkbox" id="type-context" /> chrome-extension://', el.querySelector("input").addEventListener("change", e => {
            includeChromeExtensionPages = e.target.checked, rerender();
          }), container.appendChild(el);
        }
      }(), function () {
        const container = document.getElementById("update-prop-filters");
        for (const prop of UPDATE_PROPS) {
          const el = document.createElement("label");
          el.innerHTML = `<input type="checkbox" id="prop-${prop}" checked /> ${prop}`, el.querySelector("input").addEventListener("change", e => {
            e.target.checked ? checkedUpdateProps.add(prop) : checkedUpdateProps.delete(prop), rerender();
          }), container.appendChild(el);
        }
      }(), function () {
        const today = function () {
          const d = new Date();
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        }();
        document.getElementById("date-from").value = today, document.getElementById("date-to").value = today, document.getElementById("date-from").addEventListener("change", rerender), document.getElementById("date-to").addEventListener("change", rerender);
      }(), document.getElementById("doc-filter-clear").addEventListener("click", () => {
        setDocumentFilter(null), rerender();
      }), db = yield new Promise((res, rej) => {
        const db = globalThis.indexedDB.open("raw_activity_data", 1);
        db.addEventListener("success", () => res(db.result)), db.addEventListener("error", rej), db.addEventListener("upgradeneeded", () => function (db) {
          const store = db.createObjectStore(STORE_NAME, {
            autoIncrement: !0
          });
          store.createIndex("type", "type", {
            unique: !1
          }), store.createIndex("ts", "ts", {
            unique: !1
          }), store.createIndex("virtualTs", "virtualTs", {
            unique: !1
          });
        }(db.result)), db.addEventListener("blocked", () => rej("blocked"));
      }), yield loadAll(), document.getElementById("refresh").addEventListener("click", loadAll), setInterval(pollForNewRows, 2e3), document.addEventListener("click", ev => {
        ev.target instanceof HTMLElement && ev.target.hasAttribute("data-collapsible") && ev.target.toggleAttribute("data-collapsed");
      }), document.getElementById("tab-events").addEventListener("click", () => switchTab("raw")), document.getElementById("tab-pages").addEventListener("click", () => switchTab("summary"));
    });
  })().catch(console.error);
})();
//# sourceMappingURL=main.bundle.js.map