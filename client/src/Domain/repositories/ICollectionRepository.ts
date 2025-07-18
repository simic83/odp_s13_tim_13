import { Collection } from '../models/Collection';
import type { ApiResponse, PaginatedResponse } from '../DTOs/ApiResponse';

export interface ICollectionRepository {
  getCollections(page: number, pageSize: number, userId?: number): Promise<ApiResponse<PaginatedResponse<Collection>>>;
  getUserCollections(userId: number): Promise<ApiResponse<Collection[]>>;
  getCollectionById(id: number): Promise<ApiResponse<Collection>>;
  createCollection(data: any): Promise<ApiResponse<Collection>>;
  updateCollection(id: number, data: any): Promise<ApiResponse<Collection>>;
  deleteCollection(id: number): Promise<ApiResponse<void>>;
}