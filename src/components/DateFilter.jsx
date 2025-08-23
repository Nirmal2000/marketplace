'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, X } from 'lucide-react'

/**
 * Date filter component for filtering metrics by date range
 * @param {Object} props
 * @param {Object|null} props.dateRange - Current date range selection
 * @param {Function} props.onChange - Callback when date range changes
 */
export function DateFilter({ dateRange, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempRange, setTempRange] = useState({
    from: dateRange?.start,
    to: dateRange?.end,
  })

  const handleApplyFilter = () => {
    if (tempRange.from && tempRange.to) {
      onChange({
        start: tempRange.from,
        end: tempRange.to,
      })
    } else if (tempRange.from) {
      onChange({
        start: tempRange.from,
        end: tempRange.from,
      })
    }
    setIsOpen(false)
  }

  const handleResetFilter = () => {
    setTempRange({ from: undefined, to: undefined })
    onChange(null)
    setIsOpen(false)
  }

  const formatDateRange = () => {
    if (!dateRange) return 'Select date range'
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }

    if (dateRange.start.getTime() === dateRange.end.getTime()) {
      return formatDate(dateRange.start)
    }
    
    return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
  }

  return (
    <Card className="border-gray-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Date Filter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 justify-start border-gray-600 hover:border-gray-400"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-gray-600" align="start">
              <div className="p-4 space-y-4">
                <Label className="text-sm font-medium">Select Date Range</Label>
                <Calendar
                  mode="range"
                  selected={{ from: tempRange.from, to: tempRange.to }}
                  onSelect={(range) => {
                    setTempRange({
                      from: range?.from,
                      to: range?.to,
                    })
                  }}
                  numberOfMonths={2}
                  className="border-gray-600"
                />
                <div className="flex justify-between space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilter}
                    className="border-gray-600"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApplyFilter}
                    disabled={!tempRange.from}
                  >
                    Apply Filter
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {dateRange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilter}
              className="px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {dateRange && (
          <div className="text-xs text-muted-foreground">
            Filtering data from {formatDateRange()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}