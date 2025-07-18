import type { ICommentRepository } from '../../Domain/repositories/ICommentRepository';
import type { Comment } from '../../Domain/models/Comment';
import type { ApiResponse } from '../../Domain/DTOs/ApiResponse';
import axiosInstance from '../axios.config';

export class CommentRepository implements ICommentRepository {
  async getCommentsByImage(imageId: number): Promise<ApiResponse<Comment[]>> {
    try {
      const response = await axiosInstance.get(`/comments?imageId=${imageId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch comments'
      };
    }
  }

  async createComment(data: { content: string; userId: number; imageId: number }): Promise<ApiResponse<Comment>> {
    try {
      const response = await axiosInstance.post('/comments', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create comment'
      };
    }
  }

  async deleteComment(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete(`/comments/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete comment'
      };
    }
  }
}
