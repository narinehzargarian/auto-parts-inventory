import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  AlertTriangle, 
  ArrowRight,
  Package
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type InventoryItem } from "@shared/schema";

function LowStockItemCard({ item }: { item: InventoryItem }) {
  const stockPercentage = Math.min((item.quantity / item.lowStockThreshold) * 100, 100);
  
  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate" data-testid={`text-lowstock-name-${item.id}`}>
                {item.name}
              </h3>
              <Badge variant="secondary" className="shrink-0">
                {item.category}
              </Badge>
            </div>
            <p className="font-mono text-sm text-muted-foreground">
              {item.sku}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Row {item.locationRow} | Section {item.locationSection} | Bin {item.locationBin}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0 space-y-2">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid={`text-lowstock-qty-${item.id}`}>
                {item.quantity}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{item.lowStockThreshold}</span>
            </div>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${stockPercentage}%` }}
              />
            </div>
            <Button asChild size="sm" variant="outline" data-testid={`button-restock-${item.id}`}>
              <Link href={`/inventory?id=${item.id}`}>
                Restock
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LowStock() {
  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/items"],
  });

  const lowStockItems = items
    .filter(item => item.quantity <= item.lowStockThreshold)
    .sort((a, b) => (a.quantity / a.lowStockThreshold) - (b.quantity / b.lowStockThreshold));

  const outOfStock = lowStockItems.filter(item => item.quantity === 0);
  const criticalStock = lowStockItems.filter(item => item.quantity > 0 && item.quantity <= item.lowStockThreshold * 0.5);
  const lowStock = lowStockItems.filter(item => item.quantity > item.lowStockThreshold * 0.5 && item.quantity <= item.lowStockThreshold);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Low Stock Items</h1>
          <p className="text-muted-foreground">
            {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} need attention
          </p>
        </div>
        <Button asChild variant="outline" data-testid="button-view-inventory">
          <Link href="/inventory">
            View All Inventory
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={outOfStock.length > 0 ? "border-red-500/30 bg-red-500/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Out of Stock
            </CardTitle>
            <AlertTriangle className={`w-5 h-5 ${outOfStock.length > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold" data-testid="stat-out-of-stock">{outOfStock.length}</span>
          </CardContent>
        </Card>

        <Card className={criticalStock.length > 0 ? "border-orange-500/30 bg-orange-500/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Critical
            </CardTitle>
            <AlertTriangle className={`w-5 h-5 ${criticalStock.length > 0 ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold" data-testid="stat-critical-stock">{criticalStock.length}</span>
          </CardContent>
        </Card>

        <Card className={lowStock.length > 0 ? "border-amber-500/30 bg-amber-500/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Low Stock
            </CardTitle>
            <AlertTriangle className={`w-5 h-5 ${lowStock.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold" data-testid="stat-low-stock">{lowStock.length}</span>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : lowStockItems.length > 0 ? (
          <>
            {outOfStock.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Out of Stock
                </h2>
                {outOfStock.map((item) => (
                  <LowStockItemCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {criticalStock.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Stock
                </h2>
                {criticalStock.map((item) => (
                  <LowStockItemCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {lowStock.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Low Stock
                </h2>
                {lowStock.map((item) => (
                  <LowStockItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2" data-testid="text-no-low-stock">
                All Stock Levels OK
              </h3>
              <p className="text-muted-foreground">
                No items are currently below their low stock threshold
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
