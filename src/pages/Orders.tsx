import { useState, useMemo } from 'react'
import { MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { orders as initialOrders, orderStatusColors, type Order, type OrderStatus } from '@/data/orders'
import { DataTable, SortableHeader, selectionColumn } from '@/components/DataTable'
import { OrderDetailSheet } from '@/components/OrderDetailSheet'

export function Orders() {
  const [items, setItems] = useState<Order[]>(initialOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailTarget, setDetailTarget] = useState<Order | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filtered = useMemo(() => items.filter((o) => {
    const q = search.toLowerCase()
    return (
      (o.subscriberName.toLowerCase().includes(q) ||
        o.productTitle.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)) &&
      (statusFilter === 'all' || o.status === statusFilter)
    )
  }), [items, search, statusFilter])

  const active = items.filter((o) => o.status === 'active').length
  const overdue = items.filter((o) => o.status === 'overdue').length
  const revenue = items.filter((o) => o.status !== 'returned').reduce((sum, o) => sum + o.amount, 0)

  function openDetail(order: Order) {
    setDetailTarget(order)
    setDetailOpen(true)
  }

  function handleSetStatus(ids: string[], status: OrderStatus) {
    setItems((prev) => prev.map((o) => ids.includes(o.id) ? { ...o, status } : o))
    setDetailTarget((prev) => prev && ids.includes(prev.id) ? { ...prev, status } : prev)
  }

  const columns = useMemo<ColumnDef<Order, unknown>[]>(() => [
    selectionColumn<Order>(),
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">{getValue<string>()}</span>
      ),
      size: 100,
    },
    {
      id: 'subscriber',
      accessorKey: 'subscriberName',
      header: ({ column }) => <SortableHeader column={column}>Subscriber</SortableHeader>,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{row.original.subscriberName}</span>
          <span className="text-xs text-muted-foreground">{row.original.subscriberEmail}</span>
        </div>
      ),
    },
    {
      accessorKey: 'productTitle',
      header: ({ column }) => <SortableHeader column={column}>Product</SortableHeader>,
      cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const v = getValue<OrderStatus>()
        return <Badge className={cn('capitalize', orderStatusColors[v])}>{v}</Badge>
      },
      size: 110,
    },
    {
      accessorKey: 'startDate',
      header: ({ column }) => <SortableHeader column={column}>Start</SortableHeader>,
      cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<string>()}</span>,
      size: 110,
    },
    {
      accessorKey: 'dueDate',
      header: ({ column }) => <SortableHeader column={column}>Due</SortableHeader>,
      cell: ({ row }) => {
        const due = row.original.dueDate
        const daysLeft = Math.ceil((new Date(due).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        const isOverdue = row.original.status === 'overdue' || (row.original.status !== 'returned' && daysLeft < 0)
        return (
          <span className={cn('text-sm', isOverdue && 'text-destructive font-medium')}>
            {due}
          </span>
        )
      },
      size: 110,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => <SortableHeader column={column} className="justify-end w-full">Amount</SortableHeader>,
      cell: ({ getValue }) => (
        <span className="text-sm tabular-nums block text-right">€{getValue<number>()}</span>
      ),
      size: 80,
    },
    {
      id: 'actions',
      size: 50,
      cell: ({ row }) => {
        const order = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontalIcon className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => openDetail(order)}>View details</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {order.status !== 'active' && (
                  <DropdownMenuItem onSelect={() => handleSetStatus([order.id], 'active')}>Mark as active</DropdownMenuItem>
                )}
                {order.status !== 'returned' && (
                  <DropdownMenuItem onSelect={() => handleSetStatus([order.id], 'returned')}>Mark as returned</DropdownMenuItem>
                )}
                {order.status !== 'overdue' && (
                  <DropdownMenuItem onSelect={() => handleSetStatus([order.id], 'overdue')}>Mark as overdue</DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm">{items.length} total rentals</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active rentals</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{active}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', overdue > 0 && 'text-destructive')}>{overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (active)</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">€{revenue}</div></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        onRowClick={openDetail}
        renderBulkActions={(rows, clear) => (
          <>
            <Button variant="outline" size="sm" onClick={() => { handleSetStatus(rows.map(r => r.id), 'active'); clear() }}>
              Mark active
            </Button>
            <Button variant="outline" size="sm" onClick={() => { handleSetStatus(rows.map(r => r.id), 'returned'); clear() }}>
              Mark returned
            </Button>
            <Button variant="outline" size="sm" onClick={() => { handleSetStatus(rows.map(r => r.id), 'overdue'); clear() }}>
              Mark overdue
            </Button>
          </>
        )}
      />

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {items.length} orders
      </p>

      <OrderDetailSheet
        order={detailTarget}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStatusChange={(order, status) => handleSetStatus([order.id], status)}
      />
    </div>
  )
}
