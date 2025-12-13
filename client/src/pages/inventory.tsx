import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2,
  MapPin,
  Package,
  X,
  Car,
  Image as ImageIcon,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ItemFormDialog } from "@/components/item-form-dialog";
import { MarkSoldDialog } from "@/components/mark-sold-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type InventoryItem, CATEGORIES, CONDITIONS } from "@shared/schema";

function getConditionColor(condition: string) {
  switch (condition) {
    case "Excellent":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    case "Good":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30";
    case "Fair":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
    case "Poor":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30";
    case "Salvage":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30";
    default:
      return "";
  }
}

function getVehicleCompatibilityText(item: InventoryItem): string | null {
  if (!item.vehicleMake && !item.vehicleModel) return null;
  
  const parts: string[] = [];
  if (item.vehicleYearStart && item.vehicleYearEnd) {
    parts.push(`${item.vehicleYearStart}-${item.vehicleYearEnd}`);
  } else if (item.vehicleYearStart) {
    parts.push(`${item.vehicleYearStart}+`);
  } else if (item.vehicleYearEnd) {
    parts.push(`Up to ${item.vehicleYearEnd}`);
  }
  
  if (item.vehicleMake) parts.push(item.vehicleMake);
  if (item.vehicleModel) parts.push(item.vehicleModel);
  
  return parts.length > 0 ? `Fits: ${parts.join(" ")}` : null;
}

function ItemCard({ 
  item, 
  onEdit, 
  onDelete,
  onMarkSold 
}: { 
  item: InventoryItem; 
  onEdit: () => void;
  onDelete: () => void;
  onMarkSold: () => void;
}) {
  const isLowStock = item.quantity <= item.lowStockThreshold;
  const isOutOfStock = item.quantity === 0;
  const vehicleCompat = getVehicleCompatibilityText(item);
  
  return (
    <Card className={`group relative ${isOutOfStock ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {item.imageUrl ? (
            <div className="shrink-0 w-24 h-24 rounded-md overflow-hidden bg-muted">
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-full object-cover"
                data-testid={`img-item-${item.id}`}
              />
            </div>
          ) : (
            <div className="shrink-0 w-24 h-24 rounded-md bg-muted flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
            </div>
          )}
          
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg leading-tight truncate" data-testid={`text-item-name-${item.id}`}>
                    {item.name}
                  </h3>
                  {isOutOfStock && (
                    <Badge 
                      variant="outline" 
                      className="shrink-0 bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/30"
                      data-testid={`badge-out-of-stock-${item.id}`}
                    >
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <p className="font-mono text-sm text-muted-foreground" data-testid={`text-item-sku-${item.id}`}>
                  {item.sku}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {item.quantity > 0 && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={onMarkSold}
                    title="Record Sale"
                    data-testid={`button-mark-sold-${item.id}`}
                  >
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </Button>
                )}
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={onEdit}
                  data-testid={`button-edit-${item.id}`}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={onDelete}
                  data-testid={`button-delete-${item.id}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>

            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="shrink-0">
                {item.category}
              </Badge>
              <Badge 
                variant="outline" 
                className={`shrink-0 ${getConditionColor(item.condition)}`}
              >
                {item.condition}
              </Badge>
              {vehicleCompat && (
                <Badge 
                  variant="outline" 
                  className="shrink-0 bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30"
                  data-testid={`badge-vehicle-compat-${item.id}`}
                >
                  <Car className="w-3 h-3 mr-1" />
                  {vehicleCompat}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span data-testid={`text-item-location-${item.id}`}>
                  Row {item.locationRow} | Section {item.locationSection} | Bin {item.locationBin}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 space-y-1">
            <div className={`text-2xl font-bold ${isLowStock && !isOutOfStock ? 'text-amber-600 dark:text-amber-400' : ''}`} data-testid={`text-item-qty-${item.id}`}>
              {item.quantity}
            </div>
            <div className="text-xs text-muted-foreground">in stock</div>
            {isLowStock && !isOutOfStock && (
              <Badge variant="destructive" className="mt-1">
                Low Stock
              </Badge>
            )}
            {item.price !== undefined && item.price > 0 && (
              <div className="text-sm font-medium text-muted-foreground mt-2" data-testid={`text-item-price-${item.id}`}>
                ${item.price.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Inventory() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const [formOpen, setFormOpen] = useState(searchParams.get("add") === "true");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [markSoldOpen, setMarkSoldOpen] = useState(false);
  const [markingSoldItem, setMarkingSoldItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setFormOpen(true);
    }
  }, [searchString]);

  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/items"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/items/${id}`);
      return response.status === 204 ? null : response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      toast({
        title: "Item deleted",
        description: "The item has been removed from inventory.",
      });
      setDeleteConfirmOpen(false);
      setDeletingItem(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    if (conditionFilter && conditionFilter !== "all") {
      result = result.filter((item) => item.condition === conditionFilter);
    }

    if (stockFilter === "in-stock") {
      result = result.filter((item) => item.quantity > 0);
    } else if (stockFilter === "low-stock") {
      result = result.filter((item) => item.quantity > 0 && item.quantity <= item.lowStockThreshold);
    } else if (stockFilter === "out-of-stock") {
      result = result.filter((item) => item.quantity === 0);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "quantity":
          return b.quantity - a.quantity;
        case "sku":
          return a.sku.localeCompare(b.sku);
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return result;
  }, [items, searchQuery, categoryFilter, conditionFilter, stockFilter, sortBy]);

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setDeletingItem(item);
    setDeleteConfirmOpen(true);
  };

  const handleMarkSold = (item: InventoryItem) => {
    setMarkingSoldItem(item);
    setMarkSoldOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setConditionFilter("all");
    setStockFilter("all");
    setSortBy("name");
  };

  const hasActiveFilters = searchQuery || categoryFilter !== "all" || conditionFilter !== "all" || stockFilter !== "all";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Inventory</h1>
          <p className="text-muted-foreground">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} 
            {hasActiveFilters && ` (filtered from ${items.length})`}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} data-testid="button-add-item">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]" data-testid="select-filter-category">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger className="w-[140px]" data-testid="select-filter-condition">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {CONDITIONS.map((cond) => (
                    <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[130px]" data-testid="select-filter-stock">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px]" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="sku">SKU</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters} data-testid="button-clear-filters">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
              onMarkSold={() => handleMarkSold(item)}
            />
          ))
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {hasActiveFilters ? "No items match your filters" : "No items in inventory"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first inventory item"
                }
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters-empty">
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => setFormOpen(true)} data-testid="button-add-first-item">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <ItemFormDialog
        open={formOpen}
        onOpenChange={handleCloseForm}
        item={editingItem}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingItem && deleteMutation.mutate(deletingItem.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MarkSoldDialog
        open={markSoldOpen}
        onOpenChange={setMarkSoldOpen}
        item={markingSoldItem}
      />
    </div>
  );
}
