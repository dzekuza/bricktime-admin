import { PackageIcon, UsersIcon, CreditCardIcon, TrendingUpIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const stats = [
  { label: 'Total Products', value: '26', change: '+2 this month', icon: PackageIcon },
  { label: 'Active Subscribers', value: '1,284', change: '+48 this week', icon: UsersIcon },
  { label: 'Monthly Revenue', value: '€18,420', change: '+12.4% vs last month', icon: CreditCardIcon },
  { label: 'Avg. Rating', value: '4.84', change: 'Across all sets', icon: TrendingUpIcon },
]

const recentActivity = [
  { text: 'Mailbox row added to catalogue', time: '2 hours ago', type: 'product' },
  { text: '48 new subscribers this week', time: '1 day ago', type: 'subscribers' },
  { text: 'Donut diner marked as sold out', time: '3 days ago', type: 'status' },
  { text: 'Pro plan price updated to €34/mo', time: '5 days ago', type: 'plan' },
  { text: 'Lander №7 received 14 new ratings', time: '1 week ago', type: 'rating' },
]

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across your catalogue and subscribers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <span className="text-sm">{item.text}</span>
                <Badge variant="outline" className="shrink-0 text-xs font-normal text-muted-foreground">
                  {item.time}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
