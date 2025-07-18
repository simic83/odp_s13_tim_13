import { Collection } from '../../models/Collection';

export interface ICollectionService {
  getCollections(options: {
    page: number;
    limit: number;
    userId?: string;
  }): Promise<{ collections: Collection[]; total: number; hasMore: boolean }>;
  getUserCollections(userId: string): Promise<Collection[]>;
  getCollectionById(id: string): Promise<Collection | null>;
  createCollection(data: {
    name: string;
    description?: string;
    category: string;  // promenjeno sa Category na string
    userId: string;
  }): Promise<Collection>;
  updateCollection(id: string, userId: string, data: {
    name?: string;
    description?: string;
    category?: string; // promenjeno sa Category na string
  }): Promise<Collection | null>;
  deleteCollection(id: string, userId: string): Promise<boolean>;
}
