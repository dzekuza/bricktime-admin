export type Tier = 'nano' | 'mini' | 'standard' | 'pro' | 'mega'
export type ProductStatus = 'available' | 'sold-out' | 'limited'

export interface Product {
  id: number
  title: string
  subtitle: string
  description?: string
  category: string
  year: number
  bricks: number
  minifigs: string
  rating?: string
  tier: Tier
  status: ProductStatus
  image?: string
  gallery?: string[]
}

export const products: Product[] = [
  { id: 26, title: 'Mailbox row', subtitle: '+ Postman Otto', description: 'Five-storey apartment block with a working mailbox door, three balconies, and the first crossover with set 14. Postman Otto is numbered 1/3,500.', category: 'Cityscape', year: 2026, bricks: 312, minifigs: '2 minifigs', tier: 'standard', status: 'available', image: '/images/build-castle.jpg', gallery: ['/images/build-castle.jpg', '/images/build-cactus.jpg'] },
  { id: 25, title: 'The greenhouse', subtitle: '+ Botanist Iris', description: 'A sun-drenched glass greenhouse packed with exotic plants, a potting bench, and Botanist Iris complete with watering can accessory.', category: 'Nature', year: 2026, bricks: 268, minifigs: '1 minifig', rating: '4.92', tier: 'mini', status: 'available', image: '/images/build-cactus.jpg' },
  { id: 24, title: 'Donut diner', subtitle: '+ Chef Margo', category: 'Cityscape', year: 2026, bricks: 295, minifigs: '2 minifigs', rating: '4.89', tier: 'standard', status: 'sold-out' },
  { id: 23, title: 'Pocket sub', subtitle: '+ Captain Reef', category: 'Vehicles', year: 2026, bricks: 248, minifigs: '1 minifig + variant', rating: '4.78', tier: 'mini', status: 'available', image: '/images/build-sailboat.jpg' },
  { id: 22, title: 'Lander №7', subtitle: '+ Astronaut Kai', category: 'Sci-fi', year: 2026, bricks: 274, minifigs: '1 minifig', rating: '4.84', tier: 'pro', status: 'available', image: '/images/build-spaceship.jpg' },
  { id: 21, title: 'Lighthouse', subtitle: '+ Keeper Anya', category: 'Cityscape', year: 2025, bricks: 292, minifigs: '2 minifigs', rating: '4.96', tier: 'standard', status: 'available' },
  { id: 20, title: 'The big wheel', subtitle: '+ Ringmaster Max', category: 'Cityscape', year: 2025, bricks: 412, minifigs: '3 minifigs', rating: '4.99', tier: 'mega', status: 'limited' },
  { id: 19, title: 'Field tractor', subtitle: '+ Farmer Lou', category: 'Vehicles', year: 2025, bricks: 222, minifigs: '1 minifig', rating: '4.61', tier: 'nano', status: 'available' },
  { id: 18, title: 'Record shop', subtitle: '+ DJ Petra', category: 'Cityscape', year: 2025, bricks: 264, minifigs: '1 minifig', rating: '4.81', tier: 'mini', status: 'available' },
]

export const tierColors: Record<Tier, string> = {
  nano: 'bg-secondary text-secondary-foreground',
  mini: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  standard: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  pro: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  mega: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
}

export const statusColors: Record<ProductStatus, string> = {
  available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'sold-out': 'bg-muted text-muted-foreground',
  limited: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
}
