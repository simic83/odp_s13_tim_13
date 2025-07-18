import { body, query, ValidationChain } from 'express-validator';

export const createImageValidation: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('link')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid URL'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('collectionId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid collection ID')
];

export const getImagesValidation: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long')
];
