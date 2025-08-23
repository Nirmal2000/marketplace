'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronUp, ChevronDown, TrendingUp, DollarSign, Play, Download } from 'lucide-react'

/**
 * Metrics table component for displaying MCP performance data
 * @param {Object} props
 * @param {Array} props.metrics - Array of usage metric objects
 * @param {boolean} props.isLoading - Loading state indicator
 */
export function MetricsTable({ metrics, isLoading = false }) {
  const [sortConfig, setSortConfig] = useState({
    column: 'date',
    direction: 'desc',
  })

  const handleSort = (column) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const sortedData = [...metrics].sort((a, b) => {
    const aValue = a[sortConfig.column]
    const bValue = b[sortConfig.column]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const SortableHeader = ({ column, children }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => handleSort(column)}
        className="h-auto p-0 font-medium hover:bg-transparent"
      >
        <span className="flex items-center space-x-1">
          <span>{children}</span>
          {sortConfig.column === column ? (
            sortConfig.direction === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </span>
      </Button>
    </TableHead>
  )

  const LoadingSkeleton = () => (
    <TableRow>
      {Array.from({ length: 6 }).map((_, index) => (
        <TableCell key={index}>
          <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
        </TableCell>
      ))}
    </TableRow>
  )

  // Calculate totals
  const totals = metrics.reduce(
    (acc, metric) => ({
      installs: acc.installs + metric.installs,
      runs: acc.runs + metric.runs,
      tokens_spent: acc.tokens_spent + metric.tokens_spent,
      revenue: acc.revenue + metric.revenue,
    }),
    { installs: 0, runs: 0, tokens_spent: 0, revenue: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Installs</p>
                <p className="text-2xl font-bold">{formatNumber(totals.installs)}</p>
              </div>
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Runs</p>
                <p className="text-2xl font-bold">{formatNumber(totals.runs)}</p>
              </div>
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tokens Used</p>
                <p className="text-2xl font-bold">{formatNumber(totals.tokens_spent)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totals.revenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Table */}
      <Card className="border-gray-600">
        <CardHeader>
          <CardTitle>MCP Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-600">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <SortableHeader column="mcp_name">MCP Name</SortableHeader>
                  <SortableHeader column="installs">Installs</SortableHeader>
                  <SortableHeader column="runs">Runs</SortableHeader>
                  <SortableHeader column="tokens_spent">Tokens</SortableHeader>
                  <SortableHeader column="revenue">Revenue</SortableHeader>
                  <SortableHeader column="date">Date</SortableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <LoadingSkeleton key={index} />
                  ))
                ) : sortedData.length > 0 ? (
                  sortedData.map((metric) => (
                    <TableRow key={metric.id} className="border-gray-600">
                      <TableCell className="font-medium">
                        {metric.mcp_name || 'Unknown MCP'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          {formatNumber(metric.installs)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          {formatNumber(metric.runs)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(metric.tokens_spent)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(metric.revenue)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(metric.date)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No metrics data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}