import { Image } from "../../models/Image";

export interface IImageRepository {
  create(image: Image): Promise<Image>;
  getById(id: number, userId?: number): Promise<Image>;
  getAll(page: number, limit: number, category?: string, search?: string, userId?: number): Promise<{ images: Image[], total: number }>;
  getByUserId(userId: number, page: number, limit: number, currentUserId?: number): Promise<{ images: Image[], total: number }>;
  getPopular(page: number, limit: number, userId?: number): Promise<{ images: Image[], total: number }>;
  getByCollectionId(collectionId: number, userId?: number): Promise<Image[]>;
  update(image: Image): Promise<Image>;
  delete(id: number): Promise<boolean>;
  incrementLikes(id: number): Promise<boolean>;
  decrementLikes(id: number): Promise<boolean>;
  incrementSaves(id: number): Promise<boolean>;
  decrementSaves(id: number): Promise<boolean>;
}