import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { type Order, type OrderStatus, orderStatusColors } from '@/data/orders'

function noteKey(orderId: string) {
  return `admin_note_order_${orderId}`
}

interface OrderDetailSheetProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (order: Order, status: OrderStatus, note?: string) => void
}

const statusActions: { status: OrderStatus; label: string }[] = [
  { status: 'active', label: 'Mark as active' },
  { status: 'returned', label: 'Mark as returned' },
  { status: 'overdue', label: 'Mark as overdue' },
  { status: 'processing', label: 'Mark as processing' },
]

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3 py-2.5">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )
}

export function OrderDetailSheet({ order, open, onOpenChange, onStatusChange }: OrderDetailSheetProps) {
  const [showDeclineInput, setShowDeclineInput] = useState(false)
  const [declineNote, setDeclineNote] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  useEffect(() => {
    setShowDeclineInput(false)
    setDeclineNote('')
    setAdminNote(order ? (localStorage.getItem(noteKey(order.id)) ?? '') : '')
    setNoteSaved(false)
  }, [order?.id])

  function saveNote() {
    if (!order) return
    localStorage.setItem(noteKey(order.id), adminNote)
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  if (!order) return null

  const daysLeft = Math.ceil(
    (new Date(order.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle>Order {order.id}</SheetTitle>
          <SheetDescription>Full rental details and status management.</SheetDescription>
        </SheetHeader>

        {/* Status banner */}
        <div className={cn(
          'mx-6 mb-4 flex items-center justify-between rounded-lg border px-4 py-3',
          order.status === 'overdue' && 'border-destructive/30 bg-destructive/5',
          order.status === 'return_requested' && 'border-amber-300 bg-amber-50',
          order.status === 'return_declined' && 'border-rose-300 bg-rose-50',
        )}>
          <span className="text-sm font-medium">Current status</span>
          <Badge className={cn('capitalize', orderStatusColors[order.status])}>
            {order.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Return requested action panel */}
        {order.status === 'return_requested' && (
          <div className="mx-6 mb-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">Customer requested a return</p>
            {!showDeclineInput ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => { onStatusChange(order, 'returned'); onOpenChange(false) }}
                >
                  Accept return
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeclineInput(true)}
                >
                  Decline
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder="Reason for declining (e.g. missing bricks, damaged parts)…"
                  value={declineNote}
                  onChange={(e) => setDeclineNote(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    disabled={!declineNote.trim()}
                    onClick={() => { onStatusChange(order, 'return_declined', declineNote.trim()); onOpenChange(false) }}
                  >
                    Decline return
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setShowDeclineInput(false); setDeclineNote('') }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Decline note (shown when declined) */}
        {order.returnNote && order.status === 'return_declined' && (
          <div className="mx-6 mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-rose-600">Decline note</p>
            <p className="text-sm text-rose-800">{order.returnNote}</p>
          </div>
        )}

        <div className="flex flex-col gap-0 px-6">
          {/* Subscriber */}
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subscriber</p>
          <div className="rounded-lg border divide-y">
            <Row label="Name" value={order.subscriberName} />
            <Row label="Email" value={
              <a href={`mailto:${order.subscriberEmail}`} className="text-primary hover:underline">
                {order.subscriberEmail}
              </a>
            } />
          </div>

          <Separator className="my-5" />

          {/* Product */}
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</p>
          <div className="rounded-lg border divide-y">
            <Row label="Title" value={order.productTitle} />
            <Row label="Product ID" value={`#${order.productId}`} />
          </div>

          <Separator className="my-5" />

          {/* Rental period */}
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rental period</p>
          <div className="rounded-lg border divide-y">
            <Row label="Start date" value={order.startDate} />
            <Row label="Due date" value={order.dueDate} />
            <Row
              label="Days remaining"
              value={
                order.status === 'returned' ? (
                  <span className="text-muted-foreground">Returned</span>
                ) : daysLeft < 0 ? (
                  <span className="text-destructive font-semibold">{Math.abs(daysLeft)}d overdue</span>
                ) : (
                  <span className={daysLeft <= 7 ? 'text-amber-600 font-semibold' : ''}>
                    {daysLeft}d
                  </span>
                )
              }
            />
            <Row label="Amount" value={`€${order.amount}`} />
          </div>

          <Separator className="my-5" />

          {/* Status actions */}
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Change status</p>
          <div className="flex flex-wrap gap-2">
            {statusActions
              .filter((a) => a.status !== order.status)
              .map((a) => (
                <Button
                  key={a.status}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onStatusChange(order, a.status)
                    onOpenChange(false)
                  }}
                >
                  {a.label}
                </Button>
              ))}
          </div>

          <Separator className="my-5" />

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin note</p>
          <Textarea
            placeholder="Internal note — not visible to customer…"
            rows={3}
            className="text-sm resize-none"
            value={adminNote}
            onChange={(e) => { setAdminNote(e.target.value); setNoteSaved(false) }}
          />
          <div className="mt-2 flex items-center justify-end gap-2 pb-6">
            {noteSaved && <span className="text-xs text-green-600">Saved</span>}
            <Button size="sm" variant="outline" onClick={saveNote} disabled={noteSaved}>
              Save note
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
