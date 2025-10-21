import { MemStorage } from "./memory-storage";
import { DatabaseStorage } from "./database-storage";
import type { IStorage } from "./interface";

// Export the interface and implementations
export type { IStorage };
export { MemStorage, DatabaseStorage };

// Storage factory - uses database storage when DATABASE_URL is available, otherwise falls back to memory storage
export const storage: IStorage = process.env.DATABASE_URL && process.env.USE_DATABASE ? new DatabaseStorage() : new MemStorage();