import { type InventoryItem, type InsertInventoryItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllItems(): Promise<InventoryItem[]>;
  getItem(id: string): Promise<InventoryItem | undefined>;
  createItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateItem(id: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteItem(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private items: Map<string, InventoryItem>;

  constructor() {
    this.items = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleItems: InsertInventoryItem[] = [
      {
        name: "Ford 5.0L V8 Engine",
        description: "Complete engine block from 2018 Ford Mustang GT. Low mileage, good compression.",
        sku: "ENG-FORD-50V8-001",
        category: "Engines",
        quantity: 2,
        lowStockThreshold: 3,
        condition: "Good",
        locationRow: "A",
        locationSection: "1",
        locationBin: "12",
        price: 2500,
        notes: "Pulled from salvage vehicle with 45k miles",
      },
      {
        name: "Honda Civic Transmission 5-Speed",
        description: "Manual transmission from 2015 Honda Civic. All gears shift smoothly.",
        sku: "TRN-HON-5SPD-003",
        category: "Transmissions",
        quantity: 1,
        lowStockThreshold: 2,
        condition: "Excellent",
        locationRow: "A",
        locationSection: "2",
        locationBin: "5",
        price: 850,
      },
      {
        name: "Toyota Camry Front Bumper",
        description: "OEM front bumper cover for 2019-2021 Toyota Camry. Silver metallic.",
        sku: "BDY-TOY-BMPF-007",
        category: "Body Parts",
        quantity: 4,
        lowStockThreshold: 2,
        condition: "Good",
        locationRow: "B",
        locationSection: "3",
        locationBin: "1",
        price: 350,
      },
      {
        name: "Chevy Silverado Alternator",
        description: "130 amp alternator for 2014-2018 Chevy Silverado 1500. Tested working.",
        sku: "ELC-CHV-ALT-012",
        category: "Electronics",
        quantity: 6,
        lowStockThreshold: 4,
        condition: "Good",
        locationRow: "C",
        locationSection: "1",
        locationBin: "8",
        price: 125,
      },
      {
        name: "Michelin All-Season Tire Set",
        description: "Set of 4 Michelin Defender tires. 225/55R17. 60% tread remaining.",
        sku: "TIR-MIC-AS4-015",
        category: "Tires & Wheels",
        quantity: 2,
        lowStockThreshold: 3,
        condition: "Fair",
        locationRow: "D",
        locationSection: "4",
        locationBin: "2",
        price: 200,
      },
      {
        name: "BMW 3-Series Windshield",
        description: "OEM windshield for 2017-2020 BMW 3-Series. No chips or cracks.",
        sku: "GLS-BMW-WND-019",
        category: "Glass",
        quantity: 1,
        lowStockThreshold: 2,
        condition: "Excellent",
        locationRow: "E",
        locationSection: "1",
        locationBin: "1",
        price: 450,
      },
      {
        name: "Ford F-150 Leather Seat Set",
        description: "Complete front and rear leather seat set from 2020 Ford F-150 Lariat.",
        sku: "INT-FRD-SEAT-022",
        category: "Interior",
        quantity: 1,
        lowStockThreshold: 1,
        condition: "Excellent",
        locationRow: "E",
        locationSection: "2",
        locationBin: "3",
        price: 1800,
      },
      {
        name: "Honda Accord Strut Assembly",
        description: "Front strut assembly pair for 2016-2020 Honda Accord. Monroe brand.",
        sku: "SUS-HON-STR-025",
        category: "Suspension",
        quantity: 3,
        lowStockThreshold: 4,
        condition: "Good",
        locationRow: "C",
        locationSection: "2",
        locationBin: "6",
        price: 180,
      },
      {
        name: "Brake Rotor Set - Universal",
        description: "Front brake rotors, fits multiple vehicle applications. New aftermarket.",
        sku: "BRK-UNI-ROT-028",
        category: "Brakes",
        quantity: 8,
        lowStockThreshold: 5,
        condition: "Excellent",
        locationRow: "C",
        locationSection: "3",
        locationBin: "1",
        price: 85,
      },
      {
        name: "Chevy Exhaust Manifold",
        description: "Exhaust manifold for 2010-2015 Chevy Camaro V6. Some surface rust.",
        sku: "EXH-CHV-MAN-031",
        category: "Exhaust",
        quantity: 2,
        lowStockThreshold: 2,
        condition: "Fair",
        locationRow: "D",
        locationSection: "1",
        locationBin: "4",
        price: 195,
      },
    ];

    sampleItems.forEach((item) => {
      const id = randomUUID();
      this.items.set(id, { ...item, id });
    });
  }

  async getAllItems(): Promise<InventoryItem[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: string): Promise<InventoryItem | undefined> {
    return this.items.get(id);
  }

  async createItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = randomUUID();
    const item: InventoryItem = { ...insertItem, id };
    this.items.set(id, item);
    return item;
  }

  async updateItem(id: string, updates: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const existing = this.items.get(id);
    if (!existing) {
      return undefined;
    }
    const updated: InventoryItem = { ...existing, ...updates };
    this.items.set(id, updated);
    return updated;
  }

  async deleteItem(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
}

export const storage = new MemStorage();
