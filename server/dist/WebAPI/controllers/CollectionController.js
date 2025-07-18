"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionController = void 0;
const express_validator_1 = require("express-validator");
const CollectionService_1 = require("../../Services/collections/CollectionService");
const CollectionRepository_1 = require("../../Database/repositories/collections/CollectionRepository");
class CollectionController {
    constructor() {
        this.getCollections = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 20;
                const userId = req.query.userId;
                const result = await this.collectionService.getCollections({
                    page,
                    limit: pageSize,
                    userId
                });
                res.json({
                    success: true,
                    data: {
                        items: result.collections,
                        total: result.total,
                        page,
                        pageSize,
                        hasMore: result.hasMore
                    }
                });
            }
            catch (error) {
                console.error('Error in getCollections:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.getUserCollections = async (req, res) => {
            try {
                const userId = req.params.userId;
                const collections = await this.collectionService.getUserCollections(userId);
                res.json({
                    success: true,
                    data: collections
                });
            }
            catch (error) {
                console.error('Error in getUserCollections:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.getCollectionById = async (req, res) => {
            try {
                const collection = await this.collectionService.getCollectionById(req.params.id);
                if (!collection) {
                    res.status(404).json({
                        success: false,
                        error: 'Collection not found'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: collection
                });
            }
            catch (error) {
                console.error('Error in getCollectionById:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.createCollection = async (req, res) => {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({
                        success: false,
                        errors: errors.array()
                    });
                    return;
                }
                const collection = await this.collectionService.createCollection({
                    ...req.body,
                    userId: req.user.id
                });
                res.status(201).json({
                    success: true,
                    data: collection
                });
            }
            catch (error) {
                console.error('Error in createCollection:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.updateCollection = async (req, res) => {
            try {
                const collection = await this.collectionService.updateCollection(req.params.id, req.user.id, req.body);
                if (!collection) {
                    res.status(404).json({
                        success: false,
                        error: 'Collection not found or access denied'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: collection
                });
            }
            catch (error) {
                console.error('Error in updateCollection:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.deleteCollection = async (req, res) => {
            try {
                const success = await this.collectionService.deleteCollection(req.params.id, req.user.id);
                if (!success) {
                    res.status(404).json({
                        success: false,
                        error: 'Collection not found or access denied'
                    });
                    return;
                }
                res.json({
                    success: true,
                    message: 'Collection deleted successfully'
                });
            }
            catch (error) {
                console.error('Error in deleteCollection:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        const collectionRepository = new CollectionRepository_1.CollectionRepository();
        this.collectionService = new CollectionService_1.CollectionService(collectionRepository);
    }
}
exports.CollectionController = CollectionController;
