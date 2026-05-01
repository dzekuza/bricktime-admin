export type Tier = 'nano' | 'mini' | 'standard' | 'pro' | 'mega'
export type ProductStatus = 'available' | 'sold_out' | 'limited'

export interface FaqItem {
  q: string
  a: string
}

export interface Product {
  id: number
  title: string
  subtitle: string
  description?: string
  category: string
  year: number
  bricks: number
  minifigs: string
  build_time?: string
  rating?: string
  tier: Tier
  status: ProductStatus
  image_url?: string | null
  gallery?: string[]
  faq?: FaqItem[]
}

export const products: Product[] = []

export const tierColors: Record<Tier, string> = {
  nano: 'bg-secondary text-secondary-foreground',
  mini: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  standard: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  pro: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  mega: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
}

export const statusColors: Record<ProductStatus, string> = {
  available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  sold_out: 'bg-muted text-muted-foreground',
  limited: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
}
