import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type InventoryItem } from "@shared/schema";
import { Loader2, DollarSign, AlertCircle, Minus, Plus } from "lucide-react";

interface MarkSoldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

export function MarkSoldDialog({ open, onOpenChange, item }: MarkSoldDialogProps) {
  const { toast } = useToast();
  const [salePrice, setSalePrice] = useState<string>("");
  const [quantityToSell, setQuantityToSell] = useState<number>(1);

  const { data: currentItem } = useQuery<InventoryItem>({
    queryKey: ["/api/items", item?.id],
    enabled: open && !!item?.id,
  });

  const latestItem = currentItem || item;
  const canSell = latestItem && latestItem.quantity > 0;

  useEffect(() => {
    if (open && latestItem) {
      setSalePrice("");
      setQuantityToSell(1);
    }
  }, [open, latestItem?.id]);

  const recordSaleMutation = useMutation({
    mutationFn: async () => {
      if (!latestItem || latestItem.quantity < quantityToSell) {
        throw new Error("Insufficient stock");
      }
      const pricePerUnit = salePrice ? parseFloat(salePrice) : (latestItem.price || 0);
      const response = await apiRequest("POST", "/api/sales", {
        itemId: latestItem.id,
        quantitySold: quantityToSell,
        unitPrice: pricePerUnit,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items", latestItem?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      const pricePerUnit = salePrice ? parseFloat(salePrice) : (latestItem?.price || 0);
      const totalPrice = pricePerUnit * quantityToSell;
      toast({
        title: "Sale recorded",
        description: `Sold ${quantityToSell} x ${latestItem?.name} for $${totalPrice.toFixed(2)}`,
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record sale",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSell && quantityToSell > 0) {
      recordSaleMutation.mutate();
    }
  };

  const suggestedPrice = latestItem?.price || 0;
  const maxQuantity = latestItem?.quantity || 0;

  const decrementQuantity = () => {
    if (quantityToSell > 1) {
      setQuantityToSell(quantityToSell - 1);
    }
  };

  const incrementQuantity = () => {
    if (quantityToSell < maxQuantity) {
      setQuantityToSell(quantityToSell + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Sale</DialogTitle>
          <DialogDescription>
            Record a sale for "{latestItem?.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!canSell && latestItem && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>This item is out of stock.</span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Quantity to Sell</Label>
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                size="icon" 
                variant="outline"
                onClick={decrementQuantity}
                disabled={!canSell || quantityToSell <= 1}
                data-testid="button-decrease-qty"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantityToSell}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantityToSell(Math.min(Math.max(1, val), maxQuantity));
                }}
                className="w-20 text-center"
                disabled={!canSell}
                data-testid="input-quantity-sold"
              />
              <Button 
                type="button" 
                size="icon" 
                variant="outline"
                onClick={incrementQuantity}
                disabled={!canSell || quantityToSell >= maxQuantity}
                data-testid="button-increase-qty"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                of {maxQuantity} available
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale-price">Price per Unit</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="sale-price"
                type="number"
                min="0"
                step="0.01"
                placeholder={suggestedPrice.toFixed(2)}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="pl-10"
                disabled={!canSell}
                data-testid="input-sale-price"
              />
            </div>
            {suggestedPrice > 0 && (
              <p className="text-xs text-muted-foreground">
                Listed price: ${suggestedPrice.toFixed(2)} per unit
              </p>
            )}
          </div>

          <div className="bg-muted/50 rounded-md p-3 text-sm space-y-1">
            <p className="text-muted-foreground">
              Total sale: <span className="font-medium text-foreground">
                ${((salePrice ? parseFloat(salePrice) : suggestedPrice) * quantityToSell).toFixed(2)}
              </span>
            </p>
            <p className="text-muted-foreground">
              Remaining after sale: <span className="font-medium text-foreground">
                {Math.max(0, maxQuantity - quantityToSell)}
              </span>
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={recordSaleMutation.isPending}
              data-testid="button-cancel-sold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={recordSaleMutation.isPending || !canSell || quantityToSell < 1}
              data-testid="button-confirm-sold"
            >
              {recordSaleMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Record Sale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
