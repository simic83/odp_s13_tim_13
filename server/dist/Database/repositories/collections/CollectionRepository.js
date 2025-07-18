"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionRepository = void 0;
const Collection_1 = require("../../../Domain/models/Collection");
const DbConnectionPool_1 = require("../../connection/DbConnectionPool");
class CollectionRepository {
    constructor() {
        this.repository = DbConnectionPool_1.AppDataSource.getRepository(Collection_1.Collection);
    }
    async findById(id) {
        return await this.repository.findOne({
            where: { id },
            relations: ['user', 'images', 'images.user']
        });
    }
    async findByUser(userId) {
        return await this.repository.find({
            where: { userId },
            relations: ['images'],
            order: { createdAt: 'DESC' }
        });
    }
    async findAll(options) {
        const query = this.repository.createQueryBuilder('collection')
            .leftJoinAndSelect('collection.user', 'user')
            .leftJoinAndSelect('collection.images', 'images')
            .orderBy('collection.createdAt', 'DESC');
        if (options.userId) {
            query.andWhere('collection.userId = :userId', { userId: options.userId });
        }
        const [collections, total] = await query
            .skip((options.page - 1) * options.limit)
            .take(options.limit)
            .getManyAndCount();
        // Update cover image for each collection
        for (const collection of collections) {
            if (collection.images && collection.images.length > 0) {
                collection.coverImage = collection.images[0].url;
            }
        }
        return { collections, total };
    }
    async create(collectionData) {
        const collection = this.repository.create(collectionData);
        return await this.repository.save(collection);
    }
    async update(id, collectionData) {
        await this.repository.update(id, collectionData);
        return await this.findById(id);
    }
    async delete(id) {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }
}
exports.CollectionRepository = CollectionRepository;
