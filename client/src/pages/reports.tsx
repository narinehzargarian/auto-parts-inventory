import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type InventoryItem, type SaleRecord, CATEGORIES, CONDITIONS } from "@shared/schema";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#0088FE",
];

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  variant = "default",
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  variant?: "default" | "success" | "warning";
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
          <div>
            <span
              className="text-3xl font-bold"
              data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {value}
            </span>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const { data: items = [], isLoading: itemsLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/items"],
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery<SaleRecord[]>({
    queryKey: ["/api/sales"],
  });

  const isLoading = itemsLoading || salesLoading;

  const totalInventoryValue = items.reduce((acc, item) => {
    return acc + (item.quantity * (item.price || 0));
  }, 0);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const lowStockItems = items.filter(
    (item) => item.quantity <= item.lowStockThreshold
  );

  const totalSalesRevenue = sales.reduce((acc, sale) => acc + sale.totalPrice, 0);
  const totalItemsSold = sales.reduce((acc, sale) => acc + sale.quantitySold, 0);

  const categoryData = CATEGORIES.map((category) => {
    const categoryItems = items.filter((item) => item.category === category);
    const count = categoryItems.length;
    const value = categoryItems.reduce(
      (acc, item) => acc + item.quantity * (item.price || 0),
      0
    );
    return { name: category, count, value };
  }).filter((cat) => cat.count > 0);

  const conditionData = CONDITIONS.map((condition) => {
    const conditionItems = items.filter((item) => item.condition === condition);
    const count = conditionItems.length;
    return { name: condition, count };
  }).filter((cond) => cond.count > 0);

  const salesByCategoryData = CATEGORIES.map((category) => {
    const categorySales = sales.filter((sale) => sale.itemCategory === category);
    const revenue = categorySales.reduce((acc, sale) => acc + sale.totalPrice, 0);
    const quantity = categorySales.reduce((acc, sale) => acc + sale.quantitySold, 0);
    return { name: category, revenue, quantity };
  }).filter((cat) => cat.revenue > 0 || cat.quantity > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">
          Reports
        </h1>
        <p className="text-muted-foreground">
          Inventory analytics and sales performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Inventory Value"
          value={formatCurrency(totalInventoryValue)}
          icon={DollarSign}
          subtitle={`${totalItems} total items`}
          variant="success"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Sales"
          value={formatCurrency(totalSalesRevenue)}
          icon={TrendingUp}
          subtitle={`${totalItemsSold} items sold`}
          variant="success"
          isLoading={isLoading}
        />
        <StatCard
          title="Unique Parts"
          value={items.length}
          icon={Package}
          subtitle={`${CATEGORIES.length} categories`}
          isLoading={isLoading}
        />
        <StatCard
          title="Low Stock"
          value={lowStockItems.length}
          icon={AlertTriangle}
          subtitle="Items below threshold"
          variant={lowStockItems.length > 0 ? "warning" : "default"}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Inventory by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} items`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No inventory data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Inventory by Condition
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : conditionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={conditionData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip
                    formatter={(value: number) => [`${value} items`, "Count"]}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--chart-1))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No inventory data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Category Value Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData}>
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                    width={70}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Value"]}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No inventory data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : salesByCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={salesByCategoryData}>
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(value) => formatCurrency(value)}
                    width={70}
                  />
                  <YAxis yAxisId="right" orientation="right" width={40} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "revenue" ? formatCurrency(value) : `${value} items`,
                      name === "revenue" ? "Revenue" : "Qty Sold",
                    ]}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    fill="hsl(var(--chart-3))"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="quantity"
                    fill="hsl(var(--chart-4))"
                    radius={[4, 4, 0, 0]}
                    name="Qty Sold"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No sales data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-md bg-background/50"
                  data-testid={`low-stock-item-${item.id}`}
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground ml-2 text-sm">
                      ({item.sku})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {item.quantity}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">
                      / {item.lowStockThreshold} min
                    </span>
                  </div>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{lowStockItems.length - 5} more items below threshold
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
