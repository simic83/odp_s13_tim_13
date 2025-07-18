import { Like } from "../../../Domain/models/Like";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class LikeRepository {
  async create(like: Like): Promise<Like> {
    try {
      const query = `INSERT INTO likes (userId, imageId) VALUES (?, ?)`;
      const [result] = await db.execute<ResultSetHeader>(query, [like.userId, like.imageId]);
      
      if (result.insertId) {
        like.id = result.insertId;
        return like;
      }
      return new Like();
    } catch (error) {
      console.error('Error creating like:', error);
      return new Like();
    }
  }

  async findByUserAndImage(userId: number, imageId: number): Promise<Like> {
    try {
      const query = `SELECT * FROM likes WHERE userId = ? AND imageId = ?`;
      const [rows] = await db.execute<RowDataPacket[]>(query, [userId, imageId]);
      
      if (rows.length > 0) {
        const row = rows[0];
        return new Like(row.id, row.userId, row.imageId, row.createdAt);
      }
      return new Like();
    } catch (error) {
      console.error('Error finding like:', error);
      return new Like();
    }
  }

  async delete(userId: number, imageId: number): Promise<boolean> {
    try {
      const query = `DELETE FROM likes WHERE userId = ? AND imageId = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [userId, imageId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting like:', error);
      return false;
    }
  }

  async isLikedByUser(imageId: number, userId: number): Promise<boolean> {
    try {
      const query = `SELECT COUNT(*) as count FROM likes WHERE userId = ? AND imageId = ?`;
      const [rows] = await db.execute<RowDataPacket[]>(query, [userId, imageId]);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking like:', error);
      return false;
    }
  }
}