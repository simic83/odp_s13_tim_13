"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const Comment_1 = require("../../Domain/models/Comment");
const Like_1 = require("../../Domain/models/Like");
const Collection_1 = require("../../Domain/models/Collection");
const DbConnectionPool_1 = require("../../Database/connection/DbConnectionPool");
class ImageService {
    constructor(imageRepository) {
        this.imageRepository = imageRepository;
        this.likeRepository = DbConnectionPool_1.AppDataSource.getRepository(Like_1.Like);
        this.commentRepository = DbConnectionPool_1.AppDataSource.getRepository(Comment_1.Comment);
        this.collectionRepository = DbConnectionPool_1.AppDataSource.getRepository(Collection_1.Collection);
    }
    async getImages(options) {
        const { images, total } = await this.imageRepository.findAll(options);
        // Add isLiked and isSaved flags if user is authenticated
        if (options.currentUserId) {
            for (const image of images) {
                image.isLiked = await this.imageRepository.isLikedByUser(image.id, options.currentUserId);
                image.isSaved = await this.imageRepository.isSavedByUser(image.id, options.currentUserId);
            }
        }
        const hasMore = options.page * options.limit < total;
        return { images, total, hasMore };
    }
    async getPopularImages(options) {
        const { images, total } = await this.imageRepository.findPopular(options);
        // Add isLiked and isSaved flags if user is authenticated
        if (options.currentUserId) {
            for (const image of images) {
                image.isLiked = await this.imageRepository.isLikedByUser(image.id, options.currentUserId);
                image.isSaved = await this.imageRepository.isSavedByUser(image.id, options.currentUserId);
            }
        }
        const hasMore = options.page * options.limit < total;
        return { images, total, hasMore };
    }
    async getImageById(id, currentUserId) {
        const image = await this.imageRepository.findById(id);
        if (image && currentUserId) {
            image.isLiked = await this.imageRepository.isLikedByUser(image.id, currentUserId);
            image.isSaved = await this.imageRepository.isSavedByUser(image.id, currentUserId);
        }
        return image;
    }
    async createImage(data) {
        return await this.imageRepository.create(data);
    }
    async updateImage(id, userId, data) {
        // Verify ownership
        const image = await this.imageRepository.findById(id);
        if (!image || image.userId !== userId) {
            return null;
        }
        return await this.imageRepository.update(id, data);
    }
    async deleteImage(id, userId) {
        // Verify ownership
        const image = await this.imageRepository.findById(id);
        if (!image || image.userId !== userId) {
            return false;
        }
        return await this.imageRepository.delete(id);
    }
    async likeImage(imageId, userId) {
        // Check if already liked
        const existingLike = await this.likeRepository.findOne({
            where: { imageId, userId }
        });
        if (existingLike) {
            return;
        }
        // Create like
        await this.likeRepository.save({ imageId, userId });
        // Increment likes count
        const image = await this.imageRepository.findById(imageId);
        if (image) {
            await this.imageRepository.update(imageId, { likes: image.likes + 1 });
        }
    }
    async unlikeImage(imageId, userId) {
        // Remove like
        const result = await this.likeRepository.delete({ imageId, userId });
        // Decrement likes count if like existed
        if (result.affected && result.affected > 0) {
            const image = await this.imageRepository.findById(imageId);
            if (image && image.likes > 0) {
                await this.imageRepository.update(imageId, { likes: image.likes - 1 });
            }
        }
    }
    async saveImage(imageId, userId, collectionId) {
        // Verify collection ownership
        const collection = await this.collectionRepository.findOne({
            where: { id: collectionId, userId }
        });
        if (!collection) {
            throw new Error('Collection not found or access denied');
        }
        // Check if image exists
        const image = await this.imageRepository.findById(imageId);
        if (!image) {
            throw new Error('Image not found');
        }
        // Update image's collection
        await this.imageRepository.update(imageId, { collectionId });
        // Increment saves count
        await this.imageRepository.update(imageId, { saves: image.saves + 1 });
    }
    async unsaveImage(imageId, userId) {
        const image = await this.imageRepository.findById(imageId);
        if (image && image.collection?.userId === userId) {
            await this.imageRepository.update(imageId, { collectionId: undefined });
            // Decrement saves count
            if (image.saves > 0) {
                await this.imageRepository.update(imageId, { saves: image.saves - 1 });
            }
        }
    }
    async getComments(imageId) {
        return await this.commentRepository.find({
            where: { imageId },
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });
    }
    async addComment(imageId, userId, content) {
        // Verify image exists
        const image = await this.imageRepository.findById(imageId);
        if (!image) {
            throw new Error('Image not found');
        }
        const comment = this.commentRepository.create({
            imageId,
            userId,
            content
        });
        const savedComment = await this.commentRepository.save(comment);
        // Load user relation
        return await this.commentRepository.findOne({
            where: { id: savedComment.id },
            relations: ['user']
        });
    }
}
exports.ImageService = ImageService;
