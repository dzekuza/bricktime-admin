import { useState, useEffect, useRef } from 'react'
import { ImagePlusIcon, XIcon, UploadIcon, Loader2Icon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { type Product, type Tier, type ProductStatus } from '@/data/products'

interface ProductEditDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: Product) => void
  nextId?: number
}

const CATEGORIES = ['Cityscape', 'Nature', 'Vehicles', 'Sci-fi', 'Architecture', 'Fantasy']
const TIERS: Tier[] = ['nano', 'mini', 'standard', 'pro', 'mega']
const STATUSES: ProductStatus[] = ['available', 'sold-out', 'limited']

const BLANK: Omit<Product, 'id'> = {
  title: '',
  subtitle: '',
  description: '',
  category: 'Cityscape',
  year: new Date().getFullYear(),
  bricks: 0,
  minifigs: '1 minifig',
  tier: 'standard',
  status: 'available',
  gallery: [],
}

export function ProductEditDialog({ product, open, onOpenChange, onSave, nextId = 0 }: ProductEditDialogProps) {
  const isAdd = product === null
  const [form, setForm] = useState<Product>({ id: nextId, ...BLANK })
  const [galleryInput, setGalleryInput] = useState('')
  const [coverDragging, setCoverDragging] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setForm(product ? { ...product, gallery: product.gallery ?? [] } : { id: nextId, ...BLANK })
    setGalleryInput('')
  }, [open, product, nextId])

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function uploadToStorage(file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('products').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('products').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleCoverFile(file: File) {
    setCoverUploading(true)
    try {
      const url = await uploadToStorage(file)
      set('image', url)
    } finally {
      setCoverUploading(false)
    }
  }

  function handleCoverDrop(e: React.DragEvent) {
    e.preventDefault()
    setCoverDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleCoverFile(file)
  }

  // Gallery
  function addGalleryUrl() {
    const url = galleryInput.trim()
    if (!url) return
    set('gallery', [...(form.gallery ?? []), url])
    setGalleryInput('')
  }

  async function handleGalleryFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return
    setGalleryUploading(true)
    try {
      const urls = await Promise.all(files.map(uploadToStorage))
      set('gallery', [...(form.gallery ?? []), ...urls])
    } finally {
      setGalleryUploading(false)
    }
  }

  function removeGalleryItem(i: number) {
    set('gallery', (form.gallery ?? []).filter((_, idx) => idx !== i))
  }

  function handleSave() {
    onSave(form)
    onOpenChange(false)
  }

  const canSave = form.title.trim().length > 0 && form.bricks > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 sm:max-w-2xl w-full p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle>{isAdd ? 'Add product' : 'Edit product'}</SheetTitle>
          <SheetDescription>
            {isAdd ? 'Fill in the details to add a new set to the catalogue.' : `Editing "${product?.title}"`}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0">
          <TabsList className="mx-6 mt-4 w-fit">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* ── Details tab ─────────────────────────────────────────── */}
          <TabsContent value="details" className="flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Bakery corner"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  placeholder="e.g. + Baker Anna"
                  value={form.subtitle}
                  onChange={(e) => set('subtitle', e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe this set — what makes it special, what's included, any crossovers…"
                  className="min-h-[120px] resize-y"
                  value={form.description ?? ''}
                  onChange={(e) => set('description', e.target.value)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => set('category', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" value={form.year} onChange={(e) => set('year', Number(e.target.value))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bricks">Brick count</Label>
                  <Input
                    id="bricks"
                    type="number"
                    placeholder="0"
                    value={form.bricks || ''}
                    onChange={(e) => set('bricks', Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="minifigs">Minifigs</Label>
                  <Input id="minifigs" value={form.minifigs} onChange={(e) => set('minifigs', e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rating">Rating <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  id="rating"
                  placeholder="e.g. 4.92"
                  value={form.rating ?? ''}
                  onChange={(e) => set('rating', e.target.value || undefined)}
                />
              </div>
            </div>
          </TabsContent>

          {/* ── Media tab ───────────────────────────────────────────── */}
          <TabsContent value="media" className="flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-6">
              {/* Cover image */}
              <div className="flex flex-col gap-2">
                <Label>Cover image</Label>

                {form.image ? (
                  <div className="relative group rounded-xl overflow-hidden border aspect-video bg-muted">
                    <img
                      src={form.image}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <UploadIcon className="size-3.5 mr-1.5" />
                        Replace
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => set('image', undefined)}
                      >
                        <XIcon className="size-3.5 mr-1.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'rounded-xl border-2 border-dashed aspect-video flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors',
                      coverDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50',
                    )}
                    onDragOver={(e) => { e.preventDefault(); setCoverDragging(true) }}
                    onDragLeave={() => setCoverDragging(false)}
                    onDrop={handleCoverDrop}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <UploadIcon className="size-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium">Drop image here or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  </div>
                )}

                {coverUploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2Icon className="size-4 animate-spin" />
                    Uploading…
                  </div>
                )}

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverFile(f); e.target.value = '' }}
                />

                <div className="flex gap-2">
                  <Input
                    placeholder="Or paste image URL…"
                    value={form.image?.startsWith('blob:') ? '' : (form.image ?? '')}
                    onChange={(e) => set('image', e.target.value || undefined)}
                  />
                </div>
              </div>

              <Separator />

              {/* Gallery */}
              <div className="flex flex-col gap-3">
                <Label>Gallery</Label>

                {(form.gallery ?? []).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {(form.gallery ?? []).map((url, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border aspect-square bg-muted">
                        <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          className="absolute top-1 right-1 size-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeGalleryItem(i)}
                        >
                          <XIcon className="size-3 text-white" />
                        </button>
                      </div>
                    ))}

                    {/* Add more slot */}
                    <label className="rounded-lg border-2 border-dashed border-muted-foreground/25 aspect-square flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-muted-foreground/50 hover:bg-muted/50 transition-colors">
                      <ImagePlusIcon className="size-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryFile} />
                    </label>
                  </div>
                )}

                {(form.gallery ?? []).length === 0 && (
                  <label className="rounded-xl border-2 border-dashed border-muted-foreground/25 py-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-muted-foreground/50 hover:bg-muted/50 transition-colors">
                    <ImagePlusIcon className="size-7 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium">Add gallery images</p>
                      <p className="text-xs text-muted-foreground">Click to upload multiple images</p>
                    </div>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryFile} />
                  </label>
                )}

                {galleryUploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2Icon className="size-4 animate-spin" />
                    Uploading…
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="Or paste image URL…"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGalleryUrl())}
                  />
                  <Button variant="outline" size="sm" onClick={addGalleryUrl}>Add</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Settings tab ─────────────────────────────────────────── */}
          <TabsContent value="settings" className="flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Required tier</Label>
                  <Select value={form.tier} onValueChange={(v) => set('tier', v as Tier)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIERS.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Minimum plan needed to rent this set.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => set('status', v as ProductStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Controls visibility and availability.</p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-1.5">
                <Label>Product ID</Label>
                <Input value={form.id} disabled className="font-mono text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Auto-assigned. Used in checkout URLs.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {isAdd ? 'Add product' : 'Save changes'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
