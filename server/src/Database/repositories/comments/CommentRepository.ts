import { Comment } from "../../../Domain/models/Comment";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class CommentRepository {
  async create(comment: Comment): Promise<Comment> {
    try {
      const query = `INSERT INTO comments (content, userId, imageId) VALUES (?, ?, ?)`;
      const [result] = await db.execute<ResultSetHeader>(query, [
        comment.content,
        comment.userId,
        comment.imageId
      ]);
      
      if (result.insertId) {
        comment.id = result.insertId;
        return comment;
      }
      return new Comment();
    } catch (error) {
      console.error('Error creating comment:', error);
      return new Comment();
    }
  }

  async getByImageId(imageId: number): Promise<Comment[]> {
    try {
      const query = `
        SELECT c.*, u.username, u.profileImage
        FROM comments c
        LEFT JOIN users u ON c.userId = u.id
        WHERE c.imageId = ?
        ORDER BY c.createdAt DESC
      `;
      const [rows] = await db.execute<RowDataPacket[]>(query, [imageId]);
      
      return rows.map(row => {
        const comment = new Comment(
          row.id,
          row.content,
          row.userId,
          row.imageId,
          row.createdAt
        );
        
        comment.user = {
          id: row.userId,
          username: row.username,
          profileImage: row.profileImage
        };
        
        return comment;
      });
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }
}