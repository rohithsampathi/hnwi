"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import type { BillingTransaction } from "@/types/user"
import { 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Filter,
  Calendar
} from "lucide-react"
import { getVisibleHeadingColor, getVisibleTextColor, getMatteCardStyle, getSubtleCardStyle } from "@/lib/colors"

interface BillingHistoryProps {
  transactions?: BillingTransaction[]
  onDownloadInvoice?: (transactionId: string) => void
}

export function BillingHistory({ 
  transactions = [], 
  onDownloadInvoice 
}: BillingHistoryProps) {
  const { theme } = useTheme()
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all')
  
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true
    return transaction.status === filter
  })
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500 hover:text-white transition-colors">Success</Badge>
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500 hover:text-white transition-colors">Failed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500 hover:text-white transition-colors">Pending</Badge>
      default:
        return null
    }
  }
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount / 100) // Assuming amount is in cents
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className={`${getMatteCardStyle(theme).className}`} style={getMatteCardStyle(theme).style}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-2xl font-bold ${getVisibleHeadingColor(theme)}`}>
            Billing History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {(['all', 'success', 'failed', 'pending'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className="capitalize hover:bg-primary hover:text-white hover:border-primary transition-colors"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'No billing history available' 
                : `No ${filter} transactions found`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div 
                key={transaction.id}
                className={`p-4 rounded-lg ${getSubtleCardStyle(theme).className}`}
                style={getSubtleCardStyle(theme).style}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <p className={`font-semibold ${getVisibleTextColor(theme)}`}>
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(transaction.date)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatTime(transaction.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold text-lg ${getVisibleTextColor(theme, 'accent')}`}>
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                    
                    {transaction.status === 'success' && transaction.invoice_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadInvoice?.(transaction.id)}
                        className="ml-2 hover:bg-primary hover:text-white hover:[&>svg]:text-white transition-colors"
                      >
                        <Download className="w-4 h-4 transition-colors" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {transaction.status === 'failed' && (
                  <div className="mt-3 p-3 bg-red-500/10 rounded-md">
                    <p className="text-sm text-red-600">
                      Transaction failed. Please update your payment method and try again.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Summary Stats */}
        {transactions.length > 0 && (
          <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className={`text-2xl font-bold ${getVisibleTextColor(theme)}`}>
                {transactions.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className={`text-2xl font-bold text-green-600`}>
                {transactions.filter(t => t.status === 'success').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className={`text-2xl font-bold ${getVisibleTextColor(theme, 'accent')}`}>
                {formatCurrency(
                  transactions
                    .filter(t => t.status === 'success')
                    .reduce((sum, t) => sum + t.amount, 0),
                  'USD'
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}