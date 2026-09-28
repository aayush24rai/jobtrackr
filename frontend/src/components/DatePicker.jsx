import { useState, useEffect, useRef } from 'react'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']
const POPUP_H = 296 // approximate calendar height for flip logic

const ChevLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
)
const ChevRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
)
const CalDpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
  </svg>
)
const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
)

function toIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtDisplay(iso) {
  if (!iso) return ''
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function buildGrid(year, month) {
  const startDow = new Date(year, month, 1).getDay()
  const cursor = new Date(year, month, 1 - startDow)
  return Array.from({ length: 42 }, () => {
    const d = new Date(cursor)
    cursor.setDate(cursor.getDate() + 1)
    return d
  })
}

// disableFuture: days after today can't be picked (e.g. date applied)
export default function DatePicker({ value, onChange, name, placeholder = 'Pick a date', disableFuture = false }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const todayIso = toIso(today)

  const initDate = value ? new Date(value + 'T00:00:00') : today
  const [open, setOpen]         = useState(false)
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, width: 264 })
  const [viewYear, setViewYear] = useState(initDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initDate.getMonth())

  const triggerRef = useRef(null)
  const popupRef   = useRef(null)

  // Sync calendar view when value changes from outside
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00')
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [value])

  // Close when clicking outside both trigger and popup
  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (!triggerRef.current?.contains(e.target) && !popupRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function openPicker() {
    if (open) { setOpen(false); return }
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const top = spaceBelow >= POPUP_H ? rect.bottom + 4 : rect.top - POPUP_H - 4
    setPopupPos({ top, left: rect.left, width: Math.max(rect.width, 264) })
    setOpen(true)
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function selectDay(d) {
    onChange({ target: { name, value: toIso(d) } })
    setOpen(false)
  }

  function clearValue(e) {
    e.stopPropagation()
    onChange({ target: { name, value: '' } })
  }

  const cells = buildGrid(viewYear, viewMonth)
  // no point paging into months that are entirely in the future
  const atMaxMonth = disableFuture &&
    (viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth >= today.getMonth()))

  return (
    <div className="dp" ref={triggerRef}>
      <div
        className="dp-trigger"
        onClick={openPicker}
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && openPicker()}
      >
        <span className="dp-icon"><CalDpIcon /></span>
        <span className={`dp-val${!value ? ' dp-ph' : ''}`}>
          {value ? fmtDisplay(value) : placeholder}
        </span>
        {value && (
          <button
            type="button"
            className="dp-clear"
            onClick={clearValue}
            tabIndex={-1}
            aria-label="Clear date"
          >
            <XIcon />
          </button>
        )}
      </div>

      {open && (
        <div
          className="dp-popup"
          ref={popupRef}
          role="dialog"
          aria-label="Choose a date"
          style={{ top: popupPos.top, left: popupPos.left, width: popupPos.width }}
        >
          <div className="dp-nav">
            <button type="button" className="dp-nav-btn" onClick={prevMonth} aria-label="Previous month">
              <ChevLeft />
            </button>
            <span className="dp-month">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" className="dp-nav-btn" onClick={nextMonth} aria-label="Next month" disabled={atMaxMonth}>
              <ChevRight />
            </button>
          </div>

          <div className="dp-grid">
            {DAYS.map(d => <span key={d} className="dp-dow">{d}</span>)}
            {cells.map((d, i) => {
              const iso     = toIso(d)
              const inMonth = d.getMonth() === viewMonth
              // ISO strings compare correctly as plain strings
              const blocked = disableFuture && iso > todayIso
              return (
                <button
                  key={i}
                  type="button"
                  className={[
                    'dp-day',
                    !inMonth         ? 'dp-other' : '',
                    iso === todayIso ? 'dp-today' : '',
                    iso === value    ? 'dp-sel'   : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => selectDay(d)}
                  disabled={blocked}
                  tabIndex={inMonth && !blocked ? 0 : -1}
                  aria-label={fmtDisplay(iso)}
                  aria-pressed={iso === value}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
