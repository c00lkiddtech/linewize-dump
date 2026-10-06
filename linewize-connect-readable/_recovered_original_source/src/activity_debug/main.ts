import { type ActivityEvent } from '../background/activity_log/DebugActivityReporter'

const STORE_NAME = 'raw_activity_data'

const TYPE_MAP: Record<string, string> = {
    'user-identity': 'Context',
    'client-identity': 'Context',
    'client-state': 'Context',
    'web-request': 'Request',
    'document-open': 'Open',
    'document-update': 'Update',
    'document-close': 'Close',
}

const UPDATE_PROPS = ['title', 'isActive', 'isVisible', 'isFocused', 'isAudible', 'idleState', 'blocked'] as const
type UpdateProp = (typeof UPDATE_PROPS)[number]

// --- State ---

const checkedTypes = new Set<string>(['document-open', 'document-update', 'document-close'])
const checkedUpdateProps = new Set<UpdateProp>(UPDATE_PROPS)
let filteredDocumentId: string | null = null
let includeChromeExtensionPages = false

function todayLocalISO(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDateRange(): { from: number; to: number } {
    const fromVal = (document.getElementById('date-from') as HTMLInputElement).value
    const toVal = (document.getElementById('date-to') as HTMLInputElement).value
    const from = fromVal ? new Date(fromVal).getTime() : 0
    const to = toVal ? new Date(toVal).getTime() + 86400000 : Infinity // inclusive end of day
    return { from, to }
}

function getUpdateFlags(record: ActivityEvent & { type: 'document-update' }) {
    const blocked = record.data.policyResult?.isBlocked
    return { ...record.data, blocked }
}

// --- Filtering ---

function shouldShowRecord(record: ActivityEvent, excludedDocs: Set<string>): boolean {
    const id = extractActivityId(record)
    if (id && excludedDocs.has(id)) return false
    if (filteredDocumentId !== null && extractActivityId(record) !== filteredDocumentId) return false

    if (!checkedTypes.has(record.type)) return false

    const { from, to } = getDateRange()
    if (record.ts < from || record.ts >= to) return false

    if (record.type === 'document-update') {
        // Only show if at least one checked prop is present in data
        if (checkedUpdateProps.size === 0) return false
        const data = getUpdateFlags(record)
        return UPDATE_PROPS.some((p) => checkedUpdateProps.has(p) && data[p] !== undefined)
    }

    return true
}

// --- IDB ---

function openRawActivityDb() {
    return new Promise<IDBDatabase>((res, rej) => {
        const db = globalThis.indexedDB.open('raw_activity_data', 1)
        db.addEventListener('success', () => res(db.result))
        db.addEventListener('error', rej)
        db.addEventListener('upgradeneeded', () => upgradeDatabase(db.result))
        db.addEventListener('blocked', () => rej('blocked'))
    })
}

function upgradeDatabase(db: IDBDatabase) {
    const store = db.createObjectStore(STORE_NAME, { autoIncrement: true })
    store.createIndex('type', 'type', { unique: false })
    store.createIndex('ts', 'ts', { unique: false })
    store.createIndex('virtualTs', 'virtualTs', { unique: false })
}

function getAllRecords(db: IDBDatabase): Promise<ActivityEvent[]> {
    return new Promise((resolve, reject) => {
        const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll()
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

function getRecordsAfterKey(db: IDBDatabase, lastKey: IDBValidKey): Promise<ActivityEvent[]> {
    return new Promise((resolve, reject) => {
        const range = IDBKeyRange.lowerBound(lastKey, true)
        const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll(range)
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

function getLastKey(db: IDBDatabase): Promise<IDBValidKey | null> {
    return new Promise((resolve, reject) => {
        const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).openCursor(null, 'prev')
        req.onsuccess = () => resolve(req.result?.key ?? null)
        req.onerror = () => reject(req.error)
    })
}

// --- Rendering ---

function formatTs(ts: number): string {
    return new Date(ts).toLocaleTimeString()
}

function renderBoolProp(val: boolean): string {
    return `<span class="prop prop-${val}">${val}</span>`
}

function renderIdleState(val: string): string {
    return `<span class="prop prop-${val}">${val}</span>`
}

function renderUpdateCells(record: ActivityEvent): string {
    if (record.type !== 'document-update') {
        return UPDATE_PROPS.map(() => '<td></td>').join('')
    }
    const data = getUpdateFlags(record)
    return UPDATE_PROPS.map((prop) => {
        const val = data[prop]
        if (val === undefined || val === null) return '<td></td>'
        if (prop === 'idleState') return `<td>${renderIdleState(val as string)}</td>`
        if (prop === 'title') return `<td>${String(val)}</td>`
        return `<td>${renderBoolProp(val as boolean)}</td>`
    }).join('')
}

function extractActivityId(record: ActivityEvent) {
    switch (record.type) {
        case 'web-request':
        case 'document-open':
        case 'document-update':
            return record.data.id.toString()
        case 'document-close':
            return record.data.toString()
        default:
            return ''
    }
}

function hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0 // unsigned 32-bit
    }
    return hash
}

const PALETTE_COUNT = 32
const PALETTE = Array.from({ length: PALETTE_COUNT }, (_, i) => {
    const hue = ((i * 360) / PALETTE_COUNT) % 360
    const light = i % 2 === 0

    const lightness = light ? 75 : 40
    const bg = `hsl(${hue}, 60%, ${lightness}%)`
    const text = light ? '#000000' : '#ffffff'

    return { bg, text }
})

function renderId(id: string) {
    const { bg, text } = PALETTE[hashString(id) % PALETTE_COUNT]
    return `<span class="prop" style="background: ${bg}; color: ${text}">${id}</span>`
}

const GAP_THRESHOLD = 300_000 // 5 minutes

function appendRows(records: ActivityEvent[]) {
    // Find documents to exclude
    const excludedDocs = new Set<string>()
    if (!includeChromeExtensionPages) {
        for (const record of allRecords) {
            if (
                record.type === 'document-open' &&
                record.data.url.toString().startsWith('chrome-extension://')
            ) {
                excludedDocs.add(record.data.id.toString())
            }
        }
    }

    // Append the new rows
    const tbody = document.getElementById('table-body')!
    let lastTimestamp: number | undefined

    for (const record of records) {
        if (!shouldShowRecord(record, excludedDocs)) continue
        if (lastTimestamp && record.virtualTs) {
            const elapsed = record.virtualTs - lastTimestamp
            if (elapsed > GAP_THRESHOLD) {
                const tr = document.createElement('tr')
                const td = document.createElement('td')
                td.colSpan = 11
                td.style.textAlign = 'center'
                td.style.color = '#bbb'
                const mins = Math.floor(elapsed / 60_000)
                const secs = Math.floor(elapsed / 1000) % 60
                td.innerText = `(${mins}m ${secs}s)`
                tr.appendChild(td)
                tbody.appendChild(tr)
            }
        }
        lastTimestamp = record.virtualTs
        const tr = document.createElement('tr')
        tr.innerHTML = `
            <td>
                ${record.virtualTs ? formatTs(record.virtualTs) : ''}
                <!-- <br/><span class="faded">${formatTs(record.ts)}</span> -->
            </td>
            <td>${renderId(extractActivityId(record))}</td>
            <td style="white-space: nowrap;">${TYPE_MAP[record.type] ?? 'UNKNOWN'}</td>
            ${renderUpdateCells(record)}
            <td>
                <pre data-collapsible data-collapsed>${JSON.stringify(record.data, null, 2)}</pre>
            </td>
        `
        tbody.appendChild(tr)
    }
}

function setStatus(msg: string) {
    document.getElementById('status')!.textContent = msg
}

function setSuccessStatus(total: number) {
    setStatus(`Last updated: ${new Date().toLocaleTimeString()} — ${total} records total.`)
}

// --- Document filter ---

function setDocumentFilter(id: string | null) {
    filteredDocumentId = id

    const row = document.getElementById('doc-filter-row')!
    const label = document.getElementById('doc-filter-label')!

    if (id !== null) {
        label.innerHTML = renderId(id)
        row.style.display = ''
    } else {
        row.style.display = 'none'
        label.innerHTML = ''
    }
}

// --- Controls ---

function buildTypeFilters() {
    const container = document.getElementById('type-filters')!

    // Context filter
    {
        const el = document.createElement('label')
        el.innerHTML = '<input type="checkbox" id="type-context" /> Context'
        el.querySelector('input')!.addEventListener('change', (e) => {
            for (const key of ['user-identity', 'client-identity', 'client-state']) {
                ;(e.target as HTMLInputElement).checked ? checkedTypes.add(key) : checkedTypes.delete(key)
            }
            rerender()
        })
        container.appendChild(el)
    }

    // Regular filters
    for (const [key, label] of Object.entries(TYPE_MAP)) {
        if (label === 'Context') continue
        const id = `type-${key}`
        const el = document.createElement('label')
        const checked = checkedTypes.has(key) ? 'checked' : ''
        el.innerHTML = `<input type="checkbox" id="${id}" ${checked} /> ${label}`
        el.querySelector('input')!.addEventListener('change', (e) => {
            ;(e.target as HTMLInputElement).checked ? checkedTypes.add(key) : checkedTypes.delete(key)
            rerender()
        })
        container.appendChild(el)
    }

    // Chrome extension filter
    {
        const el = document.createElement('label')
        el.innerHTML = '<input type="checkbox" id="type-context" /> chrome-extension://'
        el.querySelector('input')!.addEventListener('change', (e) => {
            includeChromeExtensionPages = (e.target as HTMLInputElement).checked
            rerender()
        })
        container.appendChild(el)
    }
}

function buildUpdatePropFilters() {
    const container = document.getElementById('update-prop-filters')!
    for (const prop of UPDATE_PROPS) {
        const el = document.createElement('label')
        el.innerHTML = `<input type="checkbox" id="prop-${prop}" checked /> ${prop}`
        el.querySelector('input')!.addEventListener('change', (e) => {
            ;(e.target as HTMLInputElement).checked ? checkedUpdateProps.add(prop) : checkedUpdateProps.delete(prop)
            rerender()
        })
        container.appendChild(el)
    }
}

function buildDateFilters() {
    const today = todayLocalISO()
    ;(document.getElementById('date-from') as HTMLInputElement).value = today
    ;(document.getElementById('date-to') as HTMLInputElement).value = today
    document.getElementById('date-from')!.addEventListener('change', rerender)
    document.getElementById('date-to')!.addEventListener('change', rerender)
}

// --- Document summary ---

interface DocumentSummary {
    id: string
    title: string
    url: string
    openTs: number | null
    closeTs: number | null
    lastUpdateTs: number | null
    updateCount: number
    errors: string[]
}

function buildSummaries(records: ActivityEvent[]): Map<string, DocumentSummary> {
    const map = new Map<string, DocumentSummary>()

    const get = (id: string): DocumentSummary => {
        if (!map.has(id))
            map.set(id, {
                id,
                title: '',
                url: '',
                openTs: null,
                closeTs: null,
                lastUpdateTs: null,
                updateCount: 0,
                errors: [],
            })
        return map.get(id)!
    }

    for (const record of records) {
        if (record.type === 'web-request') continue

        const id = extractActivityId(record)
        if (!id) continue

        const doc = get(id)

        if (record.type === 'document-open') {
            if (doc.openTs !== null) doc.errors.push('Multiple open events')
            doc.openTs = record.virtualTs ?? null
            doc.url = record.data.url.toString()
        } else if (record.type === 'document-update') {
            if (doc.openTs === null) doc.errors.push('Update before open')
            doc.updateCount++
            doc.lastUpdateTs = record.virtualTs ?? null
            if (record.data.title) doc.title = record.data.title
        } else if (record.type === 'document-close') {
            if (doc.openTs === null) doc.errors.push('Close before open')
            if (doc.closeTs !== null) doc.errors.push('Multiple close events')
            doc.closeTs = record.virtualTs ?? null
        }
    }

    if (!includeChromeExtensionPages) {
        for (const [id, doc] of map) {
            if (doc.url.startsWith('chrome-extension://')) {
                map.delete(id)
            }
        }
    }

    return map
}

function renderSummary(records: ActivityEvent[]) {
    const tbody = document.getElementById('summary-body')!
    tbody.innerHTML = ''
    const summaries = buildSummaries(records)

    // Sort by open time, ungrouped docs last
    const sorted = [...summaries.values()].sort((a, b) => (a.openTs ?? Infinity) - (b.openTs ?? Infinity))

    for (const doc of sorted) {
        const tr = document.createElement('tr')
        tr.style.cursor = 'pointer'
        const hasErrors = doc.errors.length > 0
        if (hasErrors) tr.style.background = '#fff3cd'
        tr.innerHTML = `
            <td>${renderId(doc.id)}</td>
            <td>${doc.title}</td>
            <td>${doc.url}</td>
            <td>${doc.openTs ? formatTs(doc.openTs) : '—'}</td>
            <td>${doc.lastUpdateTs ? formatTs(doc.lastUpdateTs) : '—'}</td>
            <td>${doc.closeTs ? formatTs(doc.closeTs) : '—'}</td>
            <td>${doc.updateCount}</td>
            <td style="color: #a00">${doc.errors.join(', ') || ''}</td>
        `
        tr.addEventListener('click', () => {
            setDocumentFilter(doc.id)
            switchTab('raw')
            rerender()
        })
        tbody.appendChild(tr)
    }
}

// --- Tabs ---

type Tab = 'raw' | 'summary'
let activeTab: Tab = 'raw'

function switchTab(tab: Tab) {
    activeTab = tab
    document.getElementById('raw-table')!.style.display = tab === 'raw' ? '' : 'none'
    document.getElementById('summary-table')!.style.display = tab === 'summary' ? '' : 'none'
    document.getElementById('tab-events')!.classList.toggle('active', tab === 'raw')
    document.getElementById('tab-pages')!.classList.toggle('active', tab === 'summary')
    if (tab === 'summary') renderSummary(allRecords)
}

// --- Main ---

let db: IDBDatabase
let lastKey: IDBValidKey | null = null
let allRecords: ActivityEvent[] = []
const POLL_INTERVAL_MS = 2000

function rerender() {
    document.getElementById('table-body')!.innerHTML = ''
    appendRows(allRecords)
    if (activeTab === 'summary') renderSummary(allRecords)
    setSuccessStatus(document.querySelector('tbody')!.rows.length)
}

async function loadAll() {
    setStatus('Loading...')
    allRecords = await getAllRecords(db)
    lastKey = allRecords.length > 0 ? await getLastKey(db) : null
    rerender()
    if (allRecords.length === 0) setStatus('No records found.')
}

async function pollForNewRows() {
    if (lastKey === null) return
    const newRecords = await getRecordsAfterKey(db, lastKey)
    if (newRecords.length > 0) {
        allRecords.push(...newRecords)
        lastKey = await getLastKey(db)
        appendRows(newRecords) // append only new rows rather than full rerender
    }
    setSuccessStatus(document.querySelector('tbody')!.rows.length)
}

async function main() {
    buildTypeFilters()
    buildUpdatePropFilters()
    buildDateFilters()

    document.getElementById('doc-filter-clear')!.addEventListener('click', () => {
        setDocumentFilter(null)
        rerender()
    })

    db = await openRawActivityDb()
    await loadAll()

    document.getElementById('refresh')!.addEventListener('click', loadAll)
    setInterval(pollForNewRows, POLL_INTERVAL_MS)

    document.addEventListener('click', (ev) => {
        if (ev.target instanceof HTMLElement && ev.target.hasAttribute('data-collapsible')) {
            ev.target.toggleAttribute('data-collapsed')
        }
    })

    document.getElementById('tab-events')!.addEventListener('click', () => switchTab('raw'))
    document.getElementById('tab-pages')!.addEventListener('click', () => switchTab('summary'))
}

main().catch(console.error)
