import { useQuery } from "@tanstack/react-query";
import { 
  Package, 
  AlertTriangle, 
  Layers, 
  TrendingUp,
  Plus,
  Search,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type InventoryItem, CATEGORIES } from "@shared/schema";

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = "default",
  isLoading 
}: { 
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  variant?: "default" | "warning" | "success";
  isLoading?: boolean;
}) {
  const variantStyles = {
    default: "bg-card",
    warning: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30",
    success: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    warning: "text-amber-600 dark:text-amber-400",
    success: "text-emerald-600 dark:text-emerald-400",
  };

  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${iconStyles[variant]}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-10 w-24" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </span>
            {trend && (
              <span className="text-sm text-muted-foreground">{trend}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryCard({ 
  name, 
  count, 
  isLoading 
}: { 
  name: string; 
  count: number;
  isLoading?: boolean;
}) {
  return (
    <Link href={`/inventory?category=${encodeURIComponent(name)}`}>
      <Card className="hover-elevate cursor-pointer transition-colors">
        <CardContent className="p-4 flex items-center justify-between gap-2">
          <span className="font-medium truncate">{name}</span>
          {isLoading ? (
            <Skeleton className="h-6 w-10" />
          ) : (
            <Badge variant="secondary" className="shrink-0" data-testid={`badge-category-${name.toLowerCase().replace(/\s+/g, '-')}`}>
              {count}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function RecentItemCard({ item }: { item: InventoryItem }) {
  const isLowStock = item.quantity <= item.lowStockThreshold;
  
  return (
    <Link href={`/inventory?id=${item.id}`}>
      <div className="flex items-center gap-4 p-3 rounded-md hover-elevate cursor-pointer">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate" data-testid={`text-item-name-${item.id}`}>{item.name}</span>
            {isLowStock && (
              <Badge variant="destructive" className="shrink-0">
                Low Stock
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span className="font-mono">{item.sku}</span>
            <span className="text-muted-foreground/50">|</span>
            <span>{item.category}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-semibold" data-testid={`text-item-qty-${item.id}`}>{item.quantity}</div>
          <div className="text-xs text-muted-foreground">in stock</div>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/items"],
  });

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const uniqueItems = items.length;
  const lowStockItems = items.filter(item => item.quantity <= item.lowStockThreshold);
  const categoryCounts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentItems = [...items]
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 5);

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your auto parts inventory</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button asChild variant="outline" data-testid="button-quick-search">
            <Link href="/inventory">
              <Search className="w-4 h-4 mr-2" />
              Quick Search
            </Link>
          </Button>
          <Button asChild data-testid="button-add-item">
            <Link href="/inventory?add=true">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Items"
          value={totalItems}
          icon={Package}
          isLoading={isLoading}
        />
        <StatCard
          title="Unique Parts"
          value={uniqueItems}
          icon={Layers}
          isLoading={isLoading}
        />
        <StatCard
          title="Low Stock"
          value={lowStockItems.length}
          icon={AlertTriangle}
          variant={lowStockItems.length > 0 ? "warning" : "default"}
          isLoading={isLoading}
        />
        <StatCard
          title="Categories"
          value={Object.keys(categoryCounts).length}
          icon={TrendingUp}
          variant="success"
          isLoading={isLoading}
        />
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-lg font-semibold">Low Stock Alert</CardTitle>
            </div>
            <Button asChild variant="ghost" size="sm" data-testid="button-view-all-low-stock">
              <Link href="/low-stock">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below minimum stock threshold
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg font-semibold">Categories</CardTitle>
            <Badge variant="outline">{Object.keys(categoryCounts).length} active</Badge>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))
            ) : (
              CATEGORIES.filter(cat => categoryCounts[cat] > 0).map((category) => (
                <CategoryCard
                  key={category}
                  name={category}
                  count={categoryCounts[category] || 0}
                />
              ))
            )}
            {!isLoading && Object.keys(categoryCounts).length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                No items in inventory yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg font-semibold">Recent Items</CardTitle>
            <Button asChild variant="ghost" size="sm" data-testid="button-view-all-items">
              <Link href="/inventory">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))
            ) : recentItems.length > 0 ? (
              recentItems.map((item) => (
                <RecentItemCard key={item.id} item={item} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No items in inventory yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
