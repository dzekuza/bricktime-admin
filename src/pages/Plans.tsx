import { useState } from 'react'
import { PencilIcon, CheckIcon, PlusIcon, XIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Plan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  subscribers: number
  color: string
  badgeClass: string
}

const initialPlans: Plan[] = [
  {
    id: 'nano',
    name: 'Nano',
    price: 7,
    description: 'Perfect for beginners — one small set per month.',
    features: ['1 set/month (up to 250 bricks)', 'Free shipping', 'Basic support'],
    subscribers: 142,
    color: '#F5F1EB',
    badgeClass: 'bg-secondary text-secondary-foreground',
  },
  {
    id: 'mini',
    name: 'Mini',
    price: 12,
    description: 'A step up — medium sets and minifig access.',
    features: ['1 set/month (up to 300 bricks)', 'Minifig included', 'Free shipping', 'Email support'],
    subscribers: 314,
    color: '#FFAEE7',
    badgeClass: 'bg-pink-100 text-pink-800',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 19,
    description: 'Most popular — full access to the main catalogue.',
    features: ['1 set/month (up to 350 bricks)', 'Minifigs included', 'Free shipping', 'Priority support'],
    subscribers: 521,
    color: '#FFD731',
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 28,
    description: 'For serious builders — access to Pro and below.',
    features: ['1 set/month (up to 400 bricks)', 'Exclusive minifigs', 'Free shipping', 'Priority support', 'Early access'],
    subscribers: 218,
    color: '#4DA2FF',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'mega',
    name: 'Mega',
    price: 49,
    description: 'The full universe — every set, every month.',
    features: ['1 set/month (any size)', 'All minifigs', 'Free express shipping', 'Dedicated support', 'Early access', 'Limited editions'],
    subscribers: 89,
    color: '#FB4903',
    badgeClass: 'bg-orange-100 text-orange-800',
  },
]

const BLANK_PLAN: Omit<Plan, 'id'> = {
  name: '',
  price: 0,
  description: '',
  features: [''],
  subscribers: 0,
  color: '#E2E8F0',
  badgeClass: 'bg-secondary text-secondary-foreground',
}

export function Plans() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans)

  // Edit price
  const [editTarget, setEditTarget] = useState<Plan | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editPrice, setEditPrice] = useState('')

  // Add plan
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState<Omit<Plan, 'id'>>(BLANK_PLAN)
  const [newFeature, setNewFeature] = useState('')

  function openEdit(plan: Plan) {
    setEditTarget(plan)
    setEditPrice(String(plan.price))
    setEditOpen(true)
  }

  function handleSave() {
    if (!editTarget) return
    const price = Number(editPrice)
    if (!isNaN(price) && price > 0) {
      setPlans((prev) => prev.map((p) => p.id === editTarget.id ? { ...p, price } : p))
    }
    setEditOpen(false)
  }

  function openAdd() {
    setAddForm(BLANK_PLAN)
    setNewFeature('')
    setAddOpen(true)
  }

  function handleAddFeature() {
    if (!newFeature.trim()) return
    setAddForm((prev) => ({ ...prev, features: [...prev.features.filter(Boolean), newFeature.trim()] }))
    setNewFeature('')
  }

  function removeFeature(i: number) {
    setAddForm((prev) => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }))
  }

  function handleAddPlan() {
    const id = addForm.name.toLowerCase().replace(/\s+/g, '-')
    setPlans((prev) => [...prev, { ...addForm, id, features: addForm.features.filter(Boolean) }])
    setAddOpen(false)
  }

  const totalSubscribers = plans.reduce((sum, p) => sum + p.subscribers, 0)
  const totalMrr = plans.reduce((sum, p) => sum + p.price * p.subscribers, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
          <p className="text-muted-foreground text-sm">
            {totalSubscribers} subscribers · €{totalMrr.toLocaleString()} MRR
          </p>
        </div>
        <Button onClick={openAdd}>
          <PlusIcon data-icon="inline-start" />
          Add plan
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full border border-black/10"
                    style={{ background: plan.color }}
                  />
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  <Badge className={cn('text-xs', plan.badgeClass)}>{plan.id}</Badge>
                </div>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => openEdit(plan)}>
                <PencilIcon className="size-3.5" />
                <span className="sr-only">Edit {plan.name}</span>
              </Button>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">€{plan.price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>

              <Separator />

              <ul className="flex flex-col gap-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-2 flex items-center justify-between text-sm text-muted-foreground border-t">
                <span>{plan.subscribers} subscribers</span>
                <span>€{(plan.price * plan.subscribers).toLocaleString()} MRR</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit price dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit {editTarget?.name} plan</DialogTitle>
            <DialogDescription>Update the monthly price for this plan.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 py-2">
            <Label htmlFor="price">Monthly price (€)</Label>
            <Input
              id="price"
              type="number"
              min={1}
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add plan dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add plan</DialogTitle>
            <DialogDescription>Create a new subscription tier.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plan-name">Name</Label>
                <Input
                  id="plan-name"
                  placeholder="e.g. Ultra"
                  value={addForm.name}
                  onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plan-price">Price (€/mo)</Label>
                <Input
                  id="plan-price"
                  type="number"
                  min={1}
                  placeholder="0"
                  value={addForm.price || ''}
                  onChange={(e) => setAddForm((p) => ({ ...p, price: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-desc">Description</Label>
              <Input
                id="plan-desc"
                placeholder="Short description for this plan"
                value={addForm.description}
                onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Label>Features</Label>
              {addForm.features.filter(Boolean).map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 text-sm rounded-md border px-3 py-2 bg-muted/40">{f}</span>
                  <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => removeFeature(i)}>
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a feature…"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                />
                <Button variant="outline" size="sm" onClick={handleAddFeature}>Add</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddPlan}
              disabled={!addForm.name.trim() || addForm.price <= 0}
            >
              Create plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
