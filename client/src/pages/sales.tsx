import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type SaleRecord } from "@shared/schema";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  testId,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  testId: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={testId}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function SaleRecordCard({ sale }: { sale: SaleRecord }) {
  const saleDate = new Date(sale.saleDate);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold truncate" data-testid={`text-sale-item-name-${sale.id}`}>
                  {sale.itemName}
                </h3>
                <p className="font-mono text-sm text-muted-foreground">
                  {sale.itemSku}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {sale.quantitySold} unit{sale.quantitySold > 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span data-testid={`text-sale-date-${sale.id}`}>
                  {format(saleDate, "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                <span>{sale.itemCategory}</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400" data-testid={`text-sale-price-${sale.id}`}>
              ${sale.totalPrice.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              ${sale.unitPrice.toFixed(2)} x {sale.quantitySold}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Sales() {
  const { data: sales = [], isLoading } = useQuery<SaleRecord[]>({
    queryKey: ["/api/sales"],
  });

  const salesData = useMemo(() => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalUnitsSold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
    const averageSalePrice = sales.length > 0 ? totalRevenue / sales.length : 0;

    const sortedByDate = [...sales].sort((a, b) => {
      const dateA = new Date(a.saleDate).getTime();
      const dateB = new Date(b.saleDate).getTime();
      return dateB - dateA;
    });

    return {
      sales: sortedByDate,
      totalRevenue,
      totalSales: sales.length,
      totalUnitsSold,
      averageSalePrice,
    };
  }, [sales]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Sales</h1>
        <p className="text-muted-foreground">
          Track your sales and revenue
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Revenue"
          value={`$${salesData.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          description="From all sales"
          testId="text-total-revenue"
        />
        <StatCard
          title="Total Transactions"
          value={salesData.totalSales.toString()}
          icon={ShoppingBag}
          description={`${salesData.totalUnitsSold} unit${salesData.totalUnitsSold !== 1 ? 's' : ''} sold`}
          testId="text-total-sales"
        />
        <StatCard
          title="Average Transaction"
          value={`$${salesData.averageSalePrice.toFixed(2)}`}
          icon={TrendingUp}
          description="Per transaction"
          testId="text-avg-sale-price"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Sales History</h2>
        {salesData.sales.length > 0 ? (
          salesData.sales.map((sale) => (
            <SaleRecordCard key={sale.id} sale={sale} />
          ))
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
              <p className="text-muted-foreground">
                Record sales from the Inventory page to track your revenue here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
