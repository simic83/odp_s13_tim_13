"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const AuthMiddleware_1 = require("./WebAPI/middlewares/AuthMiddleware");
const AuthController_1 = require("./WebAPI/controllers/AuthController");
const ImageController_1 = require("./WebAPI/controllers/ImageController");
const CollectionController_1 = require("./WebAPI/controllers/CollectionController");
const UserController_1 = require("./WebAPI/controllers/UserController");
const authValidators_1 = require("./WebAPI/validators/auth/authValidators");
const imageValidators_1 = require("./WebAPI/validators/images/imageValidators");
const express_validator_1 = require("express-validator");
const createApp = () => {
    const app = (0, express_1.default)();
    // Middleware
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Serve static files (uploaded images)
    app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));
    // Controllers
    const authController = new AuthController_1.AuthController();
    const imageController = new ImageController_1.ImageController();
    const collectionController = new CollectionController_1.CollectionController();
    const userController = new UserController_1.UserController();
    // Routes
    const apiPrefix = '/api';
    // Auth routes
    app.post(`${apiPrefix}/auth/register`, authValidators_1.registerValidation, authController.register);
    app.post(`${apiPrefix}/auth/login`, authValidators_1.loginValidation, authController.login);
    app.get(`${apiPrefix}/auth/me`, AuthMiddleware_1.authMiddleware, authController.me);
    // Image routes
    app.get(`${apiPrefix}/images`, imageValidators_1.getImagesValidation, imageController.getImages);
    app.get(`${apiPrefix}/images/popular`, imageController.getPopularImages);
    app.get(`${apiPrefix}/images/user/:userId`, imageController.getUserImages);
    app.get(`${apiPrefix}/images/:id`, imageController.getImageById);
    app.post(`${apiPrefix}/images`, AuthMiddleware_1.authMiddleware, imageController.uploadMiddleware, imageValidators_1.createImageValidation, imageController.createImage);
    app.put(`${apiPrefix}/images/:id`, AuthMiddleware_1.authMiddleware, imageController.updateImage);
    app.delete(`${apiPrefix}/images/:id`, AuthMiddleware_1.authMiddleware, imageController.deleteImage);
    app.post(`${apiPrefix}/images/:id/like`, AuthMiddleware_1.authMiddleware, imageController.likeImage);
    app.post(`${apiPrefix}/images/:id/unlike`, AuthMiddleware_1.authMiddleware, imageController.unlikeImage);
    app.post(`${apiPrefix}/images/:id/save`, AuthMiddleware_1.authMiddleware, imageController.saveImage);
    app.post(`${apiPrefix}/images/:id/unsave`, AuthMiddleware_1.authMiddleware, imageController.unsaveImage);
    app.get(`${apiPrefix}/images/:id/comments`, imageController.getComments);
    app.post(`${apiPrefix}/images/:id/comments`, AuthMiddleware_1.authMiddleware, imageController.addComment);
    // Collection routes
    app.get(`${apiPrefix}/collections`, collectionController.getCollections);
    app.get(`${apiPrefix}/collections/user/:userId`, collectionController.getUserCollections);
    app.get(`${apiPrefix}/collections/:id`, collectionController.getCollectionById);
    app.post(`${apiPrefix}/collections`, AuthMiddleware_1.authMiddleware, [
        (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
        (0, express_validator_1.body)('description').optional().trim(),
        (0, express_validator_1.body)('category').notEmpty().withMessage('Category is required')
    ], collectionController.createCollection);
    app.put(`${apiPrefix}/collections/:id`, AuthMiddleware_1.authMiddleware, collectionController.updateCollection);
    app.delete(`${apiPrefix}/collections/:id`, AuthMiddleware_1.authMiddleware, collectionController.deleteCollection);
    // User routes
    app.get(`${apiPrefix}/users/:id`, userController.getProfile);
    app.put(`${apiPrefix}/users/:id`, AuthMiddleware_1.authMiddleware, userController.updateProfile);
    // Health check
    app.get('/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    // 404 handler
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: 'Endpoint not found'
        });
    });
    // Error handler
    app.use((err, req, res, next) => {
        console.error('Error:', err);
        res.status(err.status || 500).json({
            success: false,
            error: err.message || 'Internal server error'
        });
    });
    return app;
};
exports.createApp = createApp;
