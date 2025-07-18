"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageRepository = void 0;
const Image_1 = require("../../../Domain/models/Image");
const Like_1 = require("../../../Domain/models/Like");
const DbConnectionPool_1 = require("../../connection/DbConnectionPool");
class ImageRepository {
    constructor() {
        this.repository = DbConnectionPool_1.AppDataSource.getRepository(Image_1.Image);
        this.likeRepository = DbConnectionPool_1.AppDataSource.getRepository(Like_1.Like);
    }
    async findById(id) {
        return await this.repository.findOne({
            where: { id },
            relations: ['user', 'collection', 'comments', 'comments.user']
        });
    }
    async findAll(options) {
        const query = this.repository.createQueryBuilder('image')
            .leftJoinAndSelect('image.user', 'user')
            .leftJoinAndSelect('image.collection', 'collection')
            .orderBy('image.createdAt', 'DESC');
        if (options.category) {
            query.andWhere('image.category = :category', { category: options.category });
        }
        if (options.search) {
            query.andWhere('(image.title ILIKE :search OR image.description ILIKE :search)', {
                search: `%${options.search}%`
            });
        }
        if (options.userId) {
            query.andWhere('image.userId = :userId', { userId: options.userId });
        }
        const [images, total] = await query
            .skip((options.page - 1) * options.limit)
            .take(options.limit)
            .getManyAndCount();
        return { images, total };
    }
    async findPopular(options) {
        const query = this.repository.createQueryBuilder('image')
            .leftJoinAndSelect('image.user', 'user')
            .leftJoinAndSelect('image.collection', 'collection')
            .orderBy('(image.likes + image.saves)', 'DESC')
            .addOrderBy('image.createdAt', 'DESC');
        const [images, total] = await query
            .skip((options.page - 1) * options.limit)
            .take(options.limit)
            .getManyAndCount();
        return { images, total };
    }
    async findByCollection(collectionId) {
        return await this.repository.find({
            where: { collectionId },
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });
    }
    async create(imageData) {
        const image = this.repository.create(imageData);
        return await this.repository.save(image);
    }
    async update(id, imageData) {
        await this.repository.update(id, imageData);
        return await this.findById(id);
    }
    async delete(id) {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }
    async isLikedByUser(imageId, userId) {
        const like = await this.likeRepository.findOne({
            where: { imageId, userId }
        });
        return !!like;
    }
    async isSavedByUser(imageId, userId) {
        // Check if the image is saved in any of the user's collections
        const savedImage = await this.repository
            .createQueryBuilder('image')
            .leftJoin('image.collection', 'collection')
            .where('image.id = :imageId', { imageId })
            .andWhere('collection.userId = :userId', { userId })
            .getOne();
        return !!savedImage;
    }
}
exports.ImageRepository = ImageRepository;
