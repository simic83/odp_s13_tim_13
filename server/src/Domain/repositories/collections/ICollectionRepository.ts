import { Collection } from "../../models/Collection";

export interface ICollectionRepository {
  create(collection: Collection): Promise<Collection>;
  getById(id: number): Promise<Collection>;
  getByUserId(userId: number): Promise<Collection[]>;
  getAll(page: number, limit: number, userId?: number): Promise<{ collections: Collection[], total: number }>;
  update(collection: Collection): Promise<Collection>;
  delete(id: number): Promise<boolean>;
}