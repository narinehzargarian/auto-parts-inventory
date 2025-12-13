import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInventoryItemSchema, insertSaleRecordSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all inventory items
  app.get("/api/items", async (_req, res) => {
    try {
      const items = await storage.getAllItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  // Get single inventory item
  app.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  // Create new inventory item
  app.post("/api/items", async (req, res) => {
    try {
      const validatedData = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      console.error("Error creating item:", error);
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  // Update inventory item
  app.patch("/api/items/:id", async (req, res) => {
    try {
      const partialSchema = insertInventoryItemSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const item = await storage.updateItem(req.params.id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      console.error("Error updating item:", error);
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  // Delete inventory item
  app.delete("/api/items/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Get all sales
  app.get("/api/sales", async (_req, res) => {
    try {
      const sales = await storage.getAllSales();
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  // Record a sale (decrements inventory and creates sale record)
  app.post("/api/sales", async (req, res) => {
    try {
      const { itemId, quantitySold, unitPrice } = req.body;
      
      const item = await storage.getItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      if (item.quantity < quantitySold) {
        return res.status(400).json({ message: "Insufficient quantity in stock" });
      }
      
      const totalPrice = unitPrice * quantitySold;
      
      const saleData = insertSaleRecordSchema.parse({
        itemId: item.id,
        itemName: item.name,
        itemSku: item.sku,
        itemCategory: item.category,
        quantitySold: quantitySold,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        saleDate: new Date().toISOString(),
      });
      
      const sale = await storage.createSale(saleData);
      
      await storage.updateItem(itemId, {
        quantity: item.quantity - quantitySold,
      });
      
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      console.error("Error recording sale:", error);
      res.status(500).json({ message: "Failed to record sale" });
    }
  });

  return httpServer;
}
