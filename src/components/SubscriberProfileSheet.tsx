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
import { cn } from '@/lib/utils'
import { type Subscriber, type SubscriberStatus, planColors, subscriberStatusColors } from '@/data/subscribers'
import { orders } from '@/data/orders'
import { orderStatusColors } from '@/data/orders'

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
  if (!subscriber) return null

  const subOrders = orders.filter((o) => o.subscriberEmail === subscriber.email)
  const totalSpent = subOrders.reduce((sum, o) => sum + o.amount, 0)

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
          {subOrders.length > 0 && (
            <>
              <Separator className="my-5" />
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rental history ({subOrders.length})
              </p>
              <div className="flex flex-col gap-2">
                {subOrders.map((order) => (
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
