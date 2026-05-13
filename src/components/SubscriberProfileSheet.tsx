import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

function noteKey(subId: string) {
  return `admin_note_subscriber_${subId}`
}
import { type Subscriber, type SubscriberStatus, planColors, subscriberStatusColors } from '@/data/subscribers'
import { orderStatusColors, type OrderStatus } from '@/data/orders'
import { supabase } from '@/lib/supabase'

interface SheetOrder {
  id: string
  productTitle: string
  startDate: string
  dueDate: string
  status: OrderStatus
  amount: number
}

interface SubscriberProfileSheetProps {
  subscriber: Subscriber | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (sub: Subscriber, status: SubscriberStatus) => void
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3 py-2.5">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )
}

const statusActions: { status: SubscriberStatus; label: string }[] = [
  { status: 'active', label: 'Mark as active' },
  { status: 'paused', label: 'Pause subscription' },
  { status: 'cancelled', label: 'Cancel subscription' },
]

export function SubscriberProfileSheet({
  subscriber,
  open,
  onOpenChange,
  onStatusChange,
}: SubscriberProfileSheetProps) {
  const [sheetOrders, setSheetOrders] = useState<SheetOrder[]>([])
  const [adminNote, setAdminNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  useEffect(() => {
    if (subscriber) {
      setAdminNote(localStorage.getItem(noteKey(subscriber.id)) ?? '')
      setNoteSaved(false)
    }
  }, [subscriber?.id])

  function saveNote() {
    if (!subscriber) return
    localStorage.setItem(noteKey(subscriber.id), adminNote)
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  useEffect(() => {
    if (!subscriber || !open) return
    supabase
      .from('orders')
      .select('id, product_id, start_date, due_date, status, amount')
      .eq('subscriber_id', subscriber.id)
      .order('created_at', { ascending: false })
      .then(async ({ data: orderRows }) => {
        if (!orderRows?.length) { setSheetOrders([]); return }
        const productIds = [...new Set(orderRows.map((o) => o.product_id))]
        const { data: productRows } = await supabase
          .from('products')
          .select('id, title')
          .in('id', productIds)
        const productMap = Object.fromEntries((productRows ?? []).map((p) => [p.id, p.title]))
        setSheetOrders(orderRows.map((o) => ({
          id: o.id,
          productTitle: productMap[o.product_id] ?? `Product #${o.product_id}`,
          startDate: o.start_date,
          dueDate: o.due_date,
          status: o.status as OrderStatus,
          amount: o.amount,
        })))
      })
  }, [subscriber?.id, open])

  if (!subscriber) return null

  const totalSpent = sheetOrders.reduce((sum, o) => sum + o.amount, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle>Subscriber profile</SheetTitle>
          <SheetDescription>Full account details and rental history.</SheetDescription>
        </SheetHeader>

        {/* Identity */}
        <div className="mx-6 mb-5 flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg">{initials(subscriber.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="font-semibold">{subscriber.name}</p>
            <p className="text-sm text-muted-foreground">{subscriber.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={cn('capitalize text-xs', planColors[subscriber.plan])}>
                {subscriber.plan}
              </Badge>
              <Badge className={cn('capitalize text-xs', subscriberStatusColors[subscriber.status])}>
                {subscriber.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-0 px-6">
          {/* Account info */}
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
          <div className="rounded-lg border divide-y">
            <Row label="Member since" value={subscriber.joined} />
            <Row label="Sets rented" value={subscriber.setsRented} />
            <Row
              label="Monthly spend"
              value={subscriber.monthlySpend > 0 ? `€${subscriber.monthlySpend}/mo` : <span className="text-muted-foreground">—</span>}
            />
            <Row
              label="Total spent"
              value={totalSpent > 0 ? `€${totalSpent}` : <span className="text-muted-foreground">—</span>}
            />
          </div>

          {/* Rental history */}
          {sheetOrders.length > 0 && (
            <>
              <Separator className="my-5" />
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rental history ({sheetOrders.length})
              </p>
              <div className="flex flex-col gap-2">
                {sheetOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium truncate">{order.productTitle}</span>
                      <span className="text-xs text-muted-foreground">{order.startDate} → {order.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn('capitalize text-xs', orderStatusColors[order.status])}>
                        {order.status}
                      </Badge>
                      <span className="text-xs tabular-nums text-muted-foreground">€{order.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Separator className="my-5" />

          {/* Status actions */}
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manage subscription</p>
          <div className="flex flex-wrap gap-2">
            {statusActions
              .filter((a) => a.status !== subscriber.status)
              .map((a) => (
                <Button
                  key={a.status}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onStatusChange(subscriber, a.status)
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
