import { Response, Router } from 'express';
import { validationResult } from 'express-validator';
import { CollectionService } from '../../Services/collections/CollectionService';
import { CollectionRepository } from '../../Database/repositories/collections/CollectionRepository';
import { AuthRequest, authMiddleware } from '../middlewares/AuthMiddleware';

export class CollectionController {
  public router: Router;
  private collectionService: CollectionService;

  constructor() {
    this.router = Router();
    const collectionRepository = new CollectionRepository();
    this.collectionService = new CollectionService(collectionRepository);

    // Public routes
    this.router.get('/', this.getCollections);
    this.router.get('/user/:userId', this.getUserCollections);
    this.router.get('/:id', this.getCollectionById);

    // Protected routes
    this.router.post('/', authMiddleware, this.createCollection);
    this.router.put('/:id', authMiddleware, this.updateCollection);
    this.router.delete('/:id', authMiddleware, this.deleteCollection);
  }

  getCollections = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const userId = req.query.userId as string | undefined;

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
    } catch (error) {
      console.error('Error in getCollections:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };

  getUserCollections = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const collections = await this.collectionService.getUserCollections(userId);

      res.json({
        success: true,
        data: collections
      });
    } catch (error) {
      console.error('Error in getUserCollections:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };

  getCollectionById = async (req: AuthRequest, res: Response): Promise<void> => {
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
    } catch (error) {
      console.error('Error in getCollectionById:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };

  createCollection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
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
    } catch (error) {
      console.error('Error in createCollection:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };

  updateCollection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const collection = await this.collectionService.updateCollection(
        req.params.id,
        req.user.id,
        req.body
      );

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
    } catch (error) {
      console.error('Error in updateCollection:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };

  deleteCollection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const success = await this.collectionService.deleteCollection(
        req.params.id,
        req.user.id
      );

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
    } catch (error) {
      console.error('Error in deleteCollection:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };
}
