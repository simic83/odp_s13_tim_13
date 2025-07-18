import { IUserRepository } from "../../../Domain/repositories/users/IUserRepository";
import { User } from "../../../Domain/models/User";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    try {
      const query = `INSERT INTO users (username, email, password, profileImage, bio) VALUES (?, ?, ?, ?, ?)`;
      const [result] = await db.execute<ResultSetHeader>(query, [
        user.username,
        user.email,
        user.password,
        user.profileImage,
        user.bio
      ]);
      
      if (result.insertId) {
        return new User(
          result.insertId,
          user.username,
          user.email,
          user.password,
          user.profileImage,
          user.bio
        );
      }
      return new User();
    } catch (error) {
      console.error('Error creating user:', error);
      return new User();
    }
  }

  async getById(id: number): Promise<User> {
    try {
      const query = `SELECT * FROM users WHERE id = ?`;
      const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
      
      if (rows.length > 0) {
        const row = rows[0];
        return new User(
          row.id,
          row.username,
          row.email,
          row.password,
          row.profileImage,
          row.bio,
          row.createdAt,
          row.updatedAt
        );
      }
      return new User();
    } catch (error) {
      console.error('Error getting user by id:', error);
      return new User();
    }
  }

  async getByUsername(username: string): Promise<User> {
    try {
      const query = `SELECT * FROM users WHERE username = ?`;
      const [rows] = await db.execute<RowDataPacket[]>(query, [username]);
      
      if (rows.length > 0) {
        const row = rows[0];
        return new User(
          row.id,
          row.username,
          row.email,
          row.password,
          row.profileImage,
          row.bio,
          row.createdAt,
          row.updatedAt
        );
      }
      return new User();
    } catch (error) {
      console.error('Error getting user by username:', error);
      return new User();
    }
  }

  async getByEmail(email: string): Promise<User> {
    try {
      const query = `SELECT * FROM users WHERE email = ?`;
      const [rows] = await db.execute<RowDataPacket[]>(query, [email]);
      
      if (rows.length > 0) {
        const row = rows[0];
        return new User(
          row.id,
          row.username,
          row.email,
          row.password,
          row.profileImage,
          row.bio,
          row.createdAt,
          row.updatedAt
        );
      }
      return new User();
    } catch (error) {
      console.error('Error getting user by email:', error);
      return new User();
    }
  }

  async getAll(): Promise<User[]> {
    try {
      const query = `SELECT * FROM users ORDER BY id DESC`;
      const [rows] = await db.execute<RowDataPacket[]>(query);
      
      return rows.map(row => new User(
        row.id,
        row.username,
        row.email,
        row.password,
        row.profileImage,
        row.bio,
        row.createdAt,
        row.updatedAt
      ));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async update(user: User): Promise<User> {
    try {
      const query = `UPDATE users SET username = ?, email = ?, profileImage = ?, bio = ? WHERE id = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [
        user.username,
        user.email,
        user.profileImage,
        user.bio,
        user.id
      ]);
      
      if (result.affectedRows > 0) {
        return user;
      }
      return new User();
    } catch (error) {
      console.error('Error updating user:', error);
      return new User();
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const query = `DELETE FROM users WHERE id = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    try {
      const query = `SELECT COUNT(*) as count FROM users WHERE id = ?`;
      const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking user exists:', error);
      return false;
    }
  }
}