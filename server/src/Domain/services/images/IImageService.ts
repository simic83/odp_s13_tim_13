import { Image } from "../../models/Image";
import { Comment } from "../../models/Comment";

export interface IImageService {
  getImages(page: number, limit: number, category?: string, search?: string, currentUserId?: number): Promise<any>;
  getPopularImages(page: number, limit: number, sortType?: string, currentUserId?: number): Promise<any>;  // UPDATED
  getUserImages(userId: number, page: number, limit: number, currentUserId?: number): Promise<any>;
  getImageById(id: number, currentUserId?: number): Promise<Image>;
  createImage(imageData: any): Promise<Image>;
  updateImage(id: number, userId: number, data: any): Promise<Image>;
  deleteImage(id: number, userId: number): Promise<boolean>;
  likeImage(imageId: number, userId: number): Promise<boolean>;
  unlikeImage(imageId: number, userId: number): Promise<boolean>;
  saveImage(imageId: number, userId: number, collectionId: number): Promise<boolean>;
  unsaveImage(imageId: number, userId: number): Promise<boolean>;
  getComments(imageId: number): Promise<Comment[]>;
  addComment(imageId: number, userId: number, content: string): Promise<Comment>;
}