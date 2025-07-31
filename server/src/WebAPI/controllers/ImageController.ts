import { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { IImageService } from '../../Domain/services/images/IImageService';
import { AuthRequest, authMiddleware } from '../middlewares/AuthMiddleware';

// Multer konfiguracija
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  }
}).single('image');

export class ImageController {
  private router: Router;
  private imageService: IImageService;

  constructor(imageService: IImageService) {
    this.router = Router();
    this.imageService = imageService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.getImages.bind(this));
    this.router.get('/popular', this.getPopularImages.bind(this));
    this.router.get('/user/:userId', this.getUserImages.bind(this));
    this.router.get('/:id', this.getImageById.bind(this));
    this.router.post('/', authMiddleware, upload, this.createImage.bind(this));
    this.router.put('/:id', authMiddleware, this.updateImage.bind(this));
    this.router.delete('/:id', authMiddleware, this.deleteImage.bind(this));
    this.router.post('/:id/like', authMiddleware, this.likeImage.bind(this));
    this.router.post('/:id/unlike', authMiddleware, this.unlikeImage.bind(this));
    this.router.post('/:id/save', authMiddleware, this.saveImage.bind(this));
    this.router.post('/:id/unsave', authMiddleware, this.unsaveImage.bind(this));
    this.router.get('/:id/comments', this.getComments.bind(this));
    this.router.post('/:id/comments', authMiddleware, this.addComment.bind(this));
  }

  public getRouter(): Router {
    return this.router;
  }

  // Handleri

  public async getImages(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string || req.query.pageSize as string) || 10;
      let category = req.query.category as string | undefined;
      if (category) category = category.toLowerCase();
      const search = req.query.search as string | undefined;
      
      // Extract user from token if present
      let currentUserId: number | undefined;
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
          currentUserId = decoded.userId;
        } catch (error) {
          // Token is invalid, continue without user
        }
      }
      
      const result = await this.imageService.getImages(page, limit, category, search, currentUserId);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getImages:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  public async getPopularImages(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string || req.query.pageSize as string) || 10;
      const currentUserId = (req as AuthRequest).user?.id;
      const result = await this.imageService.getPopularImages(page, limit, currentUserId);
      res.json({
        success: true,
        data: result  // Wrap in data property
      });
    } catch (error) {
      console.error('Error in getPopularImages:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  public async getUserImages(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string || req.query.pageSize as string) || 10;
      const currentUserId = (req as AuthRequest).user?.id;
      const result = await this.imageService.getUserImages(userId, page, limit, currentUserId);
      res.json({ success: true, ...result });
    } catch {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  public async getImageById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const currentUserId = (req as AuthRequest).user?.id;
      const image = await this.imageService.getImageById(id, currentUserId);
      if (image.id === 0) {
        return res.status(404).json({ success: false, error: 'Image not found' });
      }
      res.json({ success: true, data: image });
    } catch {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  public async createImage(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Image file required.' });
      }
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      // ↓↓↓ Kategoriju uvek pretvori u mala slova
      const category = req.body.category ? req.body.category.toLowerCase() : undefined;
      const { title, description, link, collectionId } = req.body;
      const url = `/uploads/${req.file.filename}`;
      const data = {
        url,
        title,
        description,
        link,
        category,
        userId,
        collectionId: collectionId ? parseInt(collectionId) : null
      };
      const image = await this.imageService.createImage(data);
      res.status(201).json({ success: true, data: image });
    } catch {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  public async updateImage(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      const data = req.body;
      // Ako postoji kategorija, pretvori u mala slova!
      if (data.category) {
        data.category = data.category.toLowerCase();
      }
      const updated = await this.imageService.updateImage(id, userId, data);
      if (updated.id === 0) {
        return res.status(404).json({ success: false, error: 'Image not found or not allowed' });
      }
      res.json({ success: true, data: updated });
    } catch {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  public async deleteImage(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      const deleted = await this.imageService.deleteImage(id, userId);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Image not found or not allowed' });
      }
      res.json({ success: true, message: 'Image deleted' });
    } catch {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  public async likeImage(req: AuthRequest, res: Response) {
    try {
      const imageId = parseInt(req.params.id);
      const userId = req.user?.id;
      const liked = await this.imageService.likeImage(imageId, userId);
      res.json({ success: liked });
    } catch {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  public async unlikeImage(req: AuthRequest, res: Response) {
    try {
      const imageId = parseInt(req.params.id);
      const userId = req.user?.id;
      const unliked = await this.imageService.unlikeImage(imageId, userId);
      res.json({ success: unliked });
    } catch {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  public async saveImage(req: AuthRequest, res: Response) {
    try {
      const imageId = parseInt(req.params.id);
      const userId = req.user?.id;
      const { collectionId } = req.body;
      if (!collectionId) {
        return res.status(400).json({ success: false, error: 'collectionId is required' });
      }
      const saved = await this.imageService.saveImage(imageId, userId, parseInt(collectionId));
      res.json({ success: saved });
    } catch {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  public async unsaveImage(req: AuthRequest, res: Response) {
    try {
      const imageId = parseInt(req.params.id);
      const userId = req.user?.id;
      const unsaved = await this.imageService.unsaveImage(imageId, userId);
      res.json({ success: unsaved });
    } catch {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  public async getComments(req: Request, res: Response) {
    try {
      const imageId = parseInt(req.params.id);
      const comments = await this.imageService.getComments(imageId);
      res.json({ success: true, data: comments });
    } catch {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  public async addComment(req: AuthRequest, res: Response) {
    try {
      const imageId = parseInt(req.params.id);
      const userId = req.user?.id;
      const { content } = req.body;
      if (!content || content.length < 1) {
        return res.status(400).json({ success: false, error: 'Content required' });
      }
      const comment = await this.imageService.addComment(imageId, userId, content);
      res.status(201).json({ success: true, data: comment });
    } catch {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
}
