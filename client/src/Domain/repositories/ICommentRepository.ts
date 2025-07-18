import { Comment } from '../models/Comment';
import type { ApiResponse } from '../DTOs/ApiResponse';

export interface ICommentRepository {
  // Vrati sve komentare za sliku
  getCommentsByImage(imageId: number): Promise<ApiResponse<Comment[]>>;

  // Kreiraj komentar
  createComment(data: { content: string; userId: number; imageId: number }): Promise<ApiResponse<Comment>>;

  // Obriši komentar (opciono)
  deleteComment(id: number): Promise<ApiResponse<void>>;
}
