"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageController = void 0;
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const ImageService_1 = require("../../Services/images/ImageService");
const ImageRepository_1 = require("../../Database/repositories/images/ImageRepository");
const fs_1 = __importDefault(require("fs"));
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || 'uploads';
        // Ensure upload directory exists
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only images are allowed'));
        }
    }
}).single('file');
class ImageController {
    constructor() {
        this.uploadMiddleware = upload;
        this.getImages = async (req, res) => {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({
                        success: false,
                        errors: errors.array()
                    });
                    return;
                }
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 20;
                const category = req.query.category;
                const search = req.query.search;
                const result = await this.imageService.getImages({
                    page,
                    limit: pageSize,
                    category,
                    search,
                    currentUserId: req.user?.id
                });
                res.json({
                    success: true,
                    data: {
                        items: result.images,
                        total: result.total,
                        page,
                        pageSize,
                        hasMore: result.hasMore
                    }
                });
            }
            catch (error) {
                console.error('Error in getImages:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.getPopularImages = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 20;
                const result = await this.imageService.getPopularImages({
                    page,
                    limit: pageSize,
                    currentUserId: req.user?.id
                });
                res.json({
                    success: true,
                    data: {
                        items: result.images,
                        total: result.total,
                        page,
                        pageSize,
                        hasMore: result.hasMore
                    }
                });
            }
            catch (error) {
                console.error('Error in getPopularImages:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.getUserImages = async (req, res) => {
            try {
                const userId = req.params.userId;
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 20;
                const result = await this.imageService.getImages({
                    page,
                    limit: pageSize,
                    userId,
                    currentUserId: req.user?.id
                });
                res.json({
                    success: true,
                    data: {
                        items: result.images,
                        total: result.total,
                        page,
                        pageSize,
                        hasMore: result.hasMore
                    }
                });
            }
            catch (error) {
                console.error('Error in getUserImages:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.getImageById = async (req, res) => {
            try {
                const image = await this.imageService.getImageById(req.params.id, req.user?.id);
                if (!image) {
                    res.status(404).json({
                        success: false,
                        error: 'Image not found'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: image
                });
            }
            catch (error) {
                console.error('Error in getImageById:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.createImage = async (req, res) => {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({
                        success: false,
                        errors: errors.array()
                    });
                    return;
                }
                if (!req.file) {
                    res.status(400).json({
                        success: false,
                        error: 'Image file is required'
                    });
                    return;
                }
                const imageUrl = `/uploads/${req.file.filename}`;
                const image = await this.imageService.createImage({
                    ...req.body,
                    url: imageUrl,
                    userId: req.user.id
                });
                res.status(201).json({
                    success: true,
                    data: image
                });
            }
            catch (error) {
                console.error('Error in createImage:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.updateImage = async (req, res) => {
            try {
                const image = await this.imageService.updateImage(req.params.id, req.user.id, req.body);
                if (!image) {
                    res.status(404).json({
                        success: false,
                        error: 'Image not found or access denied'
                    });
                    return;
                }
                res.json({
                    success: true,
                    data: image
                });
            }
            catch (error) {
                console.error('Error in updateImage:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.deleteImage = async (req, res) => {
            try {
                const success = await this.imageService.deleteImage(req.params.id, req.user.id);
                if (!success) {
                    res.status(404).json({
                        success: false,
                        error: 'Image not found or access denied'
                    });
                    return;
                }
                res.json({
                    success: true,
                    message: 'Image deleted successfully'
                });
            }
            catch (error) {
                console.error('Error in deleteImage:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.likeImage = async (req, res) => {
            try {
                await this.imageService.likeImage(req.params.id, req.user.id);
                res.json({
                    success: true,
                    message: 'Image liked successfully'
                });
            }
            catch (error) {
                console.error('Error in likeImage:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.unlikeImage = async (req, res) => {
            try {
                await this.imageService.unlikeImage(req.params.id, req.user.id);
                res.json({
                    success: true,
                    message: 'Image unliked successfully'
                });
            }
            catch (error) {
                console.error('Error in unlikeImage:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.saveImage = async (req, res) => {
            try {
                const { collectionId } = req.body;
                if (!collectionId) {
                    res.status(400).json({
                        success: false,
                        error: 'Collection ID is required'
                    });
                    return;
                }
                await this.imageService.saveImage(req.params.id, req.user.id, collectionId);
                res.json({
                    success: true,
                    message: 'Image saved successfully'
                });
            }
            catch (error) {
                console.error('Error in saveImage:', error);
                res.status(400).json({
                    success: false,
                    error: error.message || 'Server error'
                });
            }
        };
        this.unsaveImage = async (req, res) => {
            try {
                await this.imageService.unsaveImage(req.params.id, req.user.id);
                res.json({
                    success: true,
                    message: 'Image unsaved successfully'
                });
            }
            catch (error) {
                console.error('Error in unsaveImage:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.getComments = async (req, res) => {
            try {
                const comments = await this.imageService.getComments(req.params.id);
                res.json({
                    success: true,
                    data: comments
                });
            }
            catch (error) {
                console.error('Error in getComments:', error);
                res.status(500).json({
                    success: false,
                    error: 'Server error'
                });
            }
        };
        this.addComment = async (req, res) => {
            try {
                const { content } = req.body;
                if (!content || !content.trim()) {
                    res.status(400).json({
                        success: false,
                        error: 'Comment content is required'
                    });
                    return;
                }
                const comment = await this.imageService.addComment(req.params.id, req.user.id, content.trim());
                res.status(201).json({
                    success: true,
                    data: comment
                });
            }
            catch (error) {
                console.error('Error in addComment:', error);
                res.status(error.message === 'Image not found' ? 404 : 500).json({
                    success: false,
                    error: error.message || 'Server error'
                });
            }
        };
        const imageRepository = new ImageRepository_1.ImageRepository();
        this.imageService = new ImageService_1.ImageService(imageRepository);
    }
}
exports.ImageController = ImageController;
