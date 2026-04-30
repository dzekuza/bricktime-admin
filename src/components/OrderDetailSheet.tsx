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
import { cn } from '@/lib/utils'
import { type Order, type OrderStatus, orderStatusColors } from '@/data/orders'

interface OrderDetailSheetProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (order: Order, status: OrderStatus) => void
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
        )}>
          <span className="text-sm font-medium">Current status</span>
          <Badge className={cn('capitalize', orderStatusColors[order.status])}>
            {order.status}
          </Badge>
        </div>

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

          {/* Actions */}
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
