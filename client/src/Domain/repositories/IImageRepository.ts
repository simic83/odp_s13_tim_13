import { Image } from '../models/Image';
import { Comment } from '../models/Comment';
import type { ApiResponse, PaginatedResponse } from '../DTOs/ApiResponse';

export interface IImageRepository {
  getImages(page: number, pageSize: number, category?: string, search?: string): Promise<ApiResponse<PaginatedResponse<Image>>>;
  getPopularImages(page: number, pageSize: number, sortType?: string): Promise<ApiResponse<PaginatedResponse<Image>>>;  // UPDATED
  getUserImages(userId: number, page: number, pageSize: number): Promise<ApiResponse<PaginatedResponse<Image>>>;
  getImageById(id: number): Promise<ApiResponse<Image>>;
  createImage(formData: FormData): Promise<ApiResponse<Image>>;
  updateImage(id: number, data: any): Promise<ApiResponse<Image>>;
  deleteImage(id: number): Promise<ApiResponse<void>>;
  likeImage(id: number): Promise<ApiResponse<void>>;
  unlikeImage(id: number): Promise<ApiResponse<void>>;
  saveImage(id: number, collectionId: number): Promise<ApiResponse<void>>;
  unsaveImage(id: number): Promise<ApiResponse<void>>;
  getComments(imageId: number): Promise<ApiResponse<Comment[]>>;
  addComment(imageId: number, content: string): Promise<ApiResponse<Comment>>;
  getImagesByCollection(collectionId: number): Promise<ApiResponse<Image[]>>;
}