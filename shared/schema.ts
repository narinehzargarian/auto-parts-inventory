import { z } from "zod";

export const CATEGORIES = [
  "Engines",
  "Transmissions",
  "Body Parts",
  "Electronics",
  "Tires & Wheels",
  "Glass",
  "Interior",
  "Suspension",
  "Brakes",
  "Exhaust",
  "Fuel System",
  "Cooling",
  "Other"
] as const;

export const CONDITIONS = [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Salvage"
] as const;

export type Category = typeof CATEGORIES[number];
export type Condition = typeof CONDITIONS[number];

export const inventoryItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  category: z.enum(CATEGORIES),
  quantity: z.number().int().min(0, "Quantity must be 0 or greater"),
  lowStockThreshold: z.number().int().min(1).default(5),
  condition: z.enum(CONDITIONS),
  locationRow: z.string().min(1, "Row is required"),
  locationSection: z.string().min(1, "Section is required"),
  locationBin: z.string().min(1, "Bin is required"),
  price: z.number().min(0, "Price must be 0 or greater").optional(),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYearStart: z.number().int().min(1900).max(2100).optional(),
  vehicleYearEnd: z.number().int().min(1900).max(2100).optional(),
});

export const insertInventoryItemSchema = inventoryItemSchema.omit({ id: true });

export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export const saleRecordSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  itemName: z.string(),
  itemSku: z.string(),
  itemCategory: z.enum(CATEGORIES),
  quantitySold: z.number().int().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  saleDate: z.string(),
});

export const insertSaleRecordSchema = saleRecordSchema.omit({ id: true });

export type SaleRecord = z.infer<typeof saleRecordSchema>;
export type InsertSaleRecord = z.infer<typeof insertSaleRecordSchema>;

export const users = {
  id: "",
  username: "",
  password: "",
};

export type User = typeof users;
export type InsertUser = Omit<User, "id">;
