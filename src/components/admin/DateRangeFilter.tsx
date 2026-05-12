'use client'

import { CalendarDays } from 'lucide-react'

export type DateRangeMode = 'last30' | 'custom'

export interface DateRangeValue {
  mode: DateRangeMode
  startDate: string
  endDate: string
}

interface DateRangeFilterProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getDefaultDateRange(): DateRangeValue {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 30)

  return {
    mode: 'last30',
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end)
  }
}

export function formatDateRangeLabel(range: DateRangeValue): string {
  if (range.mode === 'last30') {
    return 'Last 30 days'
  }

  return `${range.startDate} to ${range.endDate}`
}

export default function DateRangeFilter({ value, onChange }: DateRangeFilterProps): JSX.Element {
  const today = toDateInputValue(new Date())

  function setLast30Days(): void {
    onChange(getDefaultDateRange())
  }

  function setCustomDate(field: 'startDate' | 'endDate', nextValue: string): void {
    const next: DateRangeValue = {
      ...value,
      mode: 'custom',
      [field]: nextValue
    }

    if (field === 'startDate' && nextValue > next.endDate) {
      next.endDate = nextValue
    }

    if (field === 'endDate' && nextValue < next.startDate) {
      next.startDate = nextValue
    }

    if (next.endDate > today) {
      next.endDate = today
    }

    onChange(next)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-orange-500" />
        <p className="text-xs font-medium text-gray-500">Date Range</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={setLast30Days}
          className={`text-left px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
            value.mode === 'last30'
              ? 'bg-orange-50 border-orange-200 text-orange-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Last 30 days
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="block text-xs text-gray-500">From</span>
            <input
              type="date"
              value={value.startDate}
              max={value.endDate}
              onChange={(e) => setCustomDate('startDate', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
          </label>

          <label className="space-y-1">
            <span className="block text-xs text-gray-500">To</span>
            <input
              type="date"
              value={value.endDate}
              min={value.startDate}
              max={today}
              onChange={(e) => setCustomDate('endDate', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
