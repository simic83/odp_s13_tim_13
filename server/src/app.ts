import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Import controller klasa i potrebnih servisa/repozitorijuma
import { AuthController } from './WebAPI/controllers/AuthController';
import { ImageController } from './WebAPI/controllers/ImageController';
import { CollectionController } from './WebAPI/controllers/CollectionController';
import { UserController } from './WebAPI/controllers/UserController';
import { CommentController } from './WebAPI/controllers/CommentController';

import { AuthService } from './Services/auth/AuthService';
import { ImageService } from './Services/images/ImageService';
import { UserRepository } from './Database/repositories/users/UserRepository';
import { ImageRepository } from './Database/repositories/images/ImageRepository';

dotenv.config();

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static folder za slike
  app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

  // Inicijalizacija servisa i repo-a
  const userRepository = new UserRepository();
  const imageRepository = new ImageRepository();

  const authService = new AuthService(userRepository);
  const imageService = new ImageService(imageRepository);

  // Kontroleri sa DI
  const authController = new AuthController(authService);
  const imageController = new ImageController(imageService);
  const collectionController = new CollectionController(); // Router se pravi u samoj klasi!
  const userController = new UserController(userRepository);
  const commentController = new CommentController();

  // Use Router za svaku kolekciju ruta!
  app.use('/api/auth', authController.getRouter());
  app.use('/api/images', imageController.getRouter());
  app.use('/api/collections', collectionController.router);
  app.use('/api/users', userController.getRouter());
  app.use('/api/comments', commentController.router);

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });
  });

  // Error handler
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  });

  return app;
};
