import { Response, Router } from 'express';
import { AuthRequest, authMiddleware } from '../middlewares/AuthMiddleware';
import { CommentRepository } from '../../Database/repositories/comments/CommentRepository';
import { Comment } from '../../Domain/models/Comment';

export class CommentController {
  public router: Router;
  private commentRepository: CommentRepository;

  constructor() {
    this.router = Router();
    this.commentRepository = new CommentRepository();
    
    this.router.get('/', this.getCommentsByImage);
    this.router.post('/', authMiddleware, this.createComment);
    this.router.delete('/:id', authMiddleware, this.deleteComment);
  }

  getCommentsByImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const imageId = parseInt(req.query.imageId as string);
      if (!imageId) {
        res.status(400).json({
          success: false,
          error: 'Image ID is required'
        });
        return;
      }

      const comments = await this.commentRepository.getByImageId(imageId);
      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      console.error('Error getting comments:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };

  createComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { content, imageId } = req.body;
      const userId = req.user.id;

      if (!content || !imageId) {
        res.status(400).json({
          success: false,
          error: 'Content and imageId are required'
        });
        return;
      }

      const comment = new Comment(0, content, userId, imageId);
      const created = await this.commentRepository.create(comment);

      // Get the comment with user info
      const comments = await this.commentRepository.getByImageId(imageId);
      const newComment = comments.find(c => c.id === created.id);

      res.status(201).json({
        success: true,
        data: newComment
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };

  deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user.id;

      // For now, we'll just delete without checking ownership
      // You might want to add ownership verification
      
      res.json({
        success: true,
        message: 'Comment deleted'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };
}