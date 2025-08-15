import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class SaveRepository {
  async create(userId: number, imageId: number, collectionId: number): Promise<boolean> {
    try {
      const query = `INSERT INTO user_saves (userId, imageId, collectionId) VALUES (?, ?, ?)`;
      const [result] = await db.execute<ResultSetHeader>(query, [userId, imageId, collectionId]);
      return result.insertId > 0;
    } catch (error) {
      console.error('Error creating save:', error);
      return false;
    }
  }

  async findByUserAndImage(userId: number, imageId: number): Promise<any> {
    try {
      const query = `SELECT * FROM user_saves WHERE userId = ? AND imageId = ?`;
      const [rows] = await db.execute<RowDataPacket[]>(query, [userId, imageId]);
      
      if (rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      console.error('Error finding save:', error);
      return null;
    }
  }

  async delete(userId: number, imageId: number): Promise<boolean> {
    try {
      const query = `DELETE FROM user_saves WHERE userId = ? AND imageId = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [userId, imageId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting save:', error);
      return false;
    }
  }

  async isSavedByUser(imageId: number, userId: number): Promise<boolean> {
    try {
      const query = `SELECT COUNT(*) as count FROM user_saves WHERE userId = ? AND imageId = ?`;
      const [rows] = await db.execute<RowDataPacket[]>(query, [userId, imageId]);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking save:', error);
      return false;
    }
  }
}