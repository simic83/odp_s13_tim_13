import { Response, Router } from 'express';
import { validationResult } from 'express-validator';
import { CollectionService } from '../../Services/collections/CollectionService';
import { ImageService } from '../../Services/images/ImageService';
import { CollectionRepository } from '../../Database/repositories/collections/CollectionRepository';
import { ImageRepository } from '../../Database/repositories/images/ImageRepository';
import { AuthRequest, authMiddleware } from '../middlewares/AuthMiddleware';

export class CollectionController {
  public router: Router;
  private collectionService: CollectionService;
  private imageService: ImageService;

  constructor() {
    this.router = Router();
    const collectionRepository = new CollectionRepository();
    const imageRepository = new ImageRepository();
    this.collectionService = new CollectionService(collectionRepository);
    this.imageService = new ImageService(imageRepository);

    // Public routes
    this.router.get('/', this.getCollections);
    this.router.get('/user/:userId', this.getUserCollections);
    this.router.get('/:id', this.getCollectionById);
    this.router.get('/:id/images', this.getCollectionImages);

    // Protected routes
    this.router.post('/', authMiddleware, this.createCollection);
    this.router.put('/:id', authMiddleware, this.updateCollection);
    this.router.delete('/:id', authMiddleware, this.deleteCollection);
  }

  // GET /api/collections?page=1&pageSize=20&userId=optional
  getCollections = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // parse & sanitize
      const rawPage = Number.parseInt(String(req.query.page ?? ''), 10);
      const rawPageSize = Number.parseInt(String(req.query.pageSize ?? ''), 10);

      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      let pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? rawPageSize : 20;
      // ograniči pageSize da se DB ne guši
      pageSize = Math.min(Math.max(pageSize, 1), 100);

      const userId = (typeof req.query.userId === 'string' && req.query.userId.trim() !== '')
        ? req.query.userId.trim()
        : undefined;

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
    } catch (error: any) {
      console.error('❌ Error in getCollections:', {
        message: error?.message,
        code: error?.code,
        sqlState: error?.sqlState
      });
      res.status(500).json({ success: false, error: 'Server error' });
    }
  };

  // GET /api/collections/user/:userId
  getUserCollections = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const collections = await this.collectionService.getUserCollections(userId);

      res.json({ success: true, data: collections });
    } catch (error: any) {
      console.error('❌ Error in getUserCollections:', {
        message: error?.message,
        code: error?.code
      });
      res.status(500).json({ success: false, error: 'Server error' });
    }
  };

  // GET /api/collections/:id
  getCollectionById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const collection = await this.collectionService.getCollectionById(req.params.id);

      if (!collection) {
        res.status(404).json({ success: false, error: 'Collection not found' });
        return;
      }

      res.json({ success: true, data: collection });
    } catch (error: any) {
      console.error('❌ Error in getCollectionById:', {
        message: error?.message,
        code: error?.code
      });
      res.status(500).json({ success: false, error: 'Server error' });
    }
  };

  // POST /api/collections
  createCollection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const collection = await this.collectionService.createCollection({
        ...req.body,
        userId: req.user.id
      });

      res.status(201).json({ success: true, data: collection });
    } catch (error: any) {
      console.error('❌ Error in createCollection:', {
        message: error?.message,
        code: error?.code
      });
      res.status(500).json({ success: false, error: 'Server error' });
    }
  };

  // PUT /api/collections/:id
  updateCollection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const collection = await this.collectionService.updateCollection(
        req.params.id,
        req.user.id,
        req.body
      );

      if (!collection) {
        res.status(404).json({ success: false, error: 'Collection not found or access denied' });
        return;
      }

      res.json({ success: true, data: collection });
    } catch (error: any) {
      console.error('❌ Error in updateCollection:', {
        message: error?.message,
        code: error?.code
      });
      res.status(500).json({ success: false, error: 'Server error' });
    }
  };

  // DELETE /api/collections/:id
  deleteCollection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const success = await this.collectionService.deleteCollection(
        req.params.id,
        req.user.id
      );

      if (!success) {
        res.status(404).json({ success: false, error: 'Collection not found or access denied' });
        return;
      }

      res.json({ success: true, message: 'Collection deleted successfully' });
    } catch (error: any) {
      console.error('❌ Error in deleteCollection:', {
        message: error?.message,
        code: error?.code
      });
      res.status(500).json({ success: false, error: 'Server error' });
    }
  };

  // GET /api/collections/:id/images
  getCollectionImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const collectionId = Number.parseInt(req.params.id, 10);
      if (!Number.isFinite(collectionId)) {
        res.status(400).json({ success: false, error: 'Invalid collection id' });
        return;
      }

      const imageRepository = new ImageRepository();
      const images = await imageRepository.getByCollectionId(collectionId);

      res.json({ success: true, data: images });
    } catch (error: any) {
      console.error('❌ Error in getCollectionImages:', {
        message: error?.message,
        code: error?.code
      });
      res.status(500).json({ success: false, error: 'Server error' });
    }
  };
}
