import { Response, NextFunction } from 'express';
import { AuthRequest } from './AuthMiddleware';

export const authorizeMiddleware = (roles?: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
      return;
    }
    next();
  };
};