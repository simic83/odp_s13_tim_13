"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImagesValidation = exports.createImageValidation = void 0;
const express_validator_1 = require("express-validator");
const Image_1 = require("../../../Domain/models/Image");
exports.createImageValidation = [
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 100 })
        .withMessage('Title must be less than 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    (0, express_validator_1.body)('link')
        .optional()
        .trim()
        .isURL()
        .withMessage('Invalid URL'),
    (0, express_validator_1.body)('category')
        .isIn(Object.values(Image_1.Category))
        .withMessage('Invalid category'),
    (0, express_validator_1.body)('collectionId')
        .optional()
        .isUUID()
        .withMessage('Invalid collection ID')
];
exports.getImagesValidation = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('pageSize')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Page size must be between 1 and 100'),
    (0, express_validator_1.query)('category')
        .optional()
        .isIn(Object.values(Image_1.Category))
        .withMessage('Invalid category'),
    (0, express_validator_1.query)('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Search query too long')
];
