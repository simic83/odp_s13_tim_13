"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionService = void 0;
class CollectionService {
    constructor(collectionRepository) {
        this.collectionRepository = collectionRepository;
    }
    async getCollections(options) {
        const { collections, total } = await this.collectionRepository.findAll(options);
        const hasMore = options.page * options.limit < total;
        return { collections, total, hasMore };
    }
    async getUserCollections(userId) {
        return await this.collectionRepository.findByUser(userId);
    }
    async getCollectionById(id) {
        return await this.collectionRepository.findById(id);
    }
    async createCollection(data) {
        return await this.collectionRepository.create(data);
    }
    async updateCollection(id, userId, data) {
        // Verify ownership
        const collection = await this.collectionRepository.findById(id);
        if (!collection || collection.userId !== userId) {
            return null;
        }
        return await this.collectionRepository.update(id, data);
    }
    async deleteCollection(id, userId) {
        // Verify ownership
        const collection = await this.collectionRepository.findById(id);
        if (!collection || collection.userId !== userId) {
            return false;
        }
        return await this.collectionRepository.delete(id);
    }
}
exports.CollectionService = CollectionService;
