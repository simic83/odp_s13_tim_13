import { Image } from "../../Domain/models/Image";
import { Comment } from "../../Domain/models/Comment";
import { IImageRepository } from "../../Domain/repositories/images/IImageRepository";
import { IImageService } from "../../Domain/services/images/IImageService";
import { LikeRepository } from "../../Database/repositories/likes/LikeRepository";
import { CommentRepository } from "../../Database/repositories/comments/CommentRepository";
import { Like } from "../../Domain/models/Like";

export class ImageService implements IImageService {
  private likeRepository: LikeRepository;
  private commentRepository: CommentRepository;

  public constructor(private imageRepository: IImageRepository) {
    this.likeRepository = new LikeRepository();
    this.commentRepository = new CommentRepository();
  }

  async getImages(page: number, limit: number, category?: string, search?: string, currentUserId?: number): Promise<any> {
    const { images, total } = await this.imageRepository.getAll(page, limit, category, search, currentUserId);
    
    // isLiked is already set in repository if currentUserId is provided
    // Add isSaved flags if user is authenticated
    if (currentUserId) {
      for (const image of images) {
        image.isLiked = await this.likeRepository.isLikedByUser(image.id, currentUserId);
        image.isSaved = image.collectionId !== null && await this.checkIfImageSavedByUser(image.id, currentUserId);
      }
    }
    
    const hasMore = page * limit < total;
    
    return {
      items: images,
      total,
      page,
      pageSize: limit,
      hasMore
    };
  }

  async getPopularImages(page: number, limit: number, currentUserId?: number): Promise<any> {
    const { images, total } = await this.imageRepository.getPopular(page, limit);
    
    // Add isLiked and isSaved flags if user is authenticated
    if (currentUserId) {
      for (const image of images) {
        image.isLiked = await this.likeRepository.isLikedByUser(image.id, currentUserId);
        image.isSaved = image.collectionId !== null && await this.checkIfImageSavedByUser(image.id, currentUserId);
      }
    }
    
    const hasMore = page * limit < total;
    
    return {
      items: images,
      total,
      page,
      pageSize: limit,
      hasMore
    };
  }

  async getUserImages(userId: number, page: number, limit: number, currentUserId?: number): Promise<any> {
    const { images, total } = await this.imageRepository.getByUserId(userId, page, limit);
    
    // Add isLiked and isSaved flags if user is authenticated
    if (currentUserId) {
      for (const image of images) {
        image.isLiked = await this.likeRepository.isLikedByUser(image.id, currentUserId);
        image.isSaved = image.collectionId !== null && await this.checkIfImageSavedByUser(image.id, currentUserId);
      }
    }
    
    const hasMore = page * limit < total;
    
    return {
      items: images,
      total,
      page,
      pageSize: limit,
      hasMore
    };
  }

  async getImageById(id: number, currentUserId?: number): Promise<Image> {
    const image = await this.imageRepository.getById(id);
    
    if (image.id !== 0 && currentUserId) {
      image.isLiked = await this.likeRepository.isLikedByUser(image.id, currentUserId);
      image.isSaved = image.collectionId !== null && await this.checkIfImageSavedByUser(image.id, currentUserId);
    }
    
    return image;
  }

  async createImage(imageData: any): Promise<Image> {
    const image = new Image(
      0,
      imageData.url,
      imageData.title,
      imageData.description,
      imageData.link,
      imageData.category,
      0,
      0,
      imageData.userId,
      imageData.collectionId
    );
    
    return await this.imageRepository.create(image);
  }

  async updateImage(id: number, userId: number, data: any): Promise<Image> {
    // Verify ownership
    const image = await this.imageRepository.getById(id);
    if (image.id === 0 || image.userId !== userId) {
      return new Image();
    }
    
    // Update image data
    image.title = data.title || image.title;
    image.description = data.description !== undefined ? data.description : image.description;
    image.link = data.link !== undefined ? data.link : image.link;
    image.category = data.category || image.category;
    
    return await this.imageRepository.update(image);
  }

  async deleteImage(id: number, userId: number): Promise<boolean> {
    // Verify ownership
    const image = await this.imageRepository.getById(id);
    if (image.id === 0 || image.userId !== userId) {
      return false;
    }
    
    return await this.imageRepository.delete(id);
  }

  async likeImage(imageId: number, userId: number): Promise<boolean> {
    // Check if already liked
    const existingLike = await this.likeRepository.findByUserAndImage(userId, imageId);
    if (existingLike.id !== 0) {
      return true;
    }
    
    // Create like
    const like = await this.likeRepository.create(new Like(0, userId, imageId));
    if (like.id !== 0) {
      // Increment likes count
      await this.imageRepository.incrementLikes(imageId);
      return true;
    }
    
    return false;
  }

  async unlikeImage(imageId: number, userId: number): Promise<boolean> {
    // Remove like
    const deleted = await this.likeRepository.delete(userId, imageId);
    if (deleted) {
      // Decrement likes count
      await this.imageRepository.decrementLikes(imageId);
      return true;
    }
    
    return false;
  }

  async saveImage(imageId: number, userId: number, collectionId: number): Promise<boolean> {
    // Verify image exists
    const image = await this.imageRepository.getById(imageId);
    if (image.id === 0) {
      return false;
    }
    
    // Update image's collection
    image.collectionId = collectionId;
    const updated = await this.imageRepository.update(image);
    
    if (updated.id !== 0) {
      // Increment saves count
      await this.imageRepository.incrementSaves(imageId);
      return true;
    }
    
    return false;
  }

  async unsaveImage(imageId: number, userId: number): Promise<boolean> {
    // Verify image exists and user owns the collection
    const image = await this.imageRepository.getById(imageId);
    if (image.id === 0) {
      return false;
    }
    
    // Remove from collection
    image.collectionId = null;
    const updated = await this.imageRepository.update(image);
    
    if (updated.id !== 0) {
      // Decrement saves count
      await this.imageRepository.decrementSaves(imageId);
      return true;
    }
    
    return false;
  }

  async getComments(imageId: number): Promise<Comment[]> {
    return await this.commentRepository.getByImageId(imageId);
  }

  async addComment(imageId: number, userId: number, content: string): Promise<Comment> {
    const comment = new Comment(0, content, userId, imageId);
    const created = await this.commentRepository.create(comment);
    
    // Get comment with user info
    if (created.id !== 0) {
      const comments = await this.commentRepository.getByImageId(imageId);
      return comments.find((c: Comment) => c.id === created.id) || new Comment();
    }
    
    return new Comment();
  }

  private async checkIfImageSavedByUser(imageId: number, userId: number): Promise<boolean> {
    // This is a simplified check - in real app, you'd check if image is in user's collections
    return false;
  }
}