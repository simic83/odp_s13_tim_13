import { IImageRepository } from "../../../Domain/repositories/images/IImageRepository";
import { Image } from "../../../Domain/models/Image";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class ImageRepository implements IImageRepository {
  async create(image: Image): Promise<Image> {
    try {
      const query = `
        INSERT INTO images (url, title, description, link, category, userId, collectionId) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        image.url,
        image.title,
        image.description,
        image.link,
        image.category,
        image.userId,
        image.collectionId
      ]);

      if (result.insertId) {
        image.id = result.insertId;
        return image;
      }
      return new Image();
    } catch (error) {
      console.error('Error creating image:', error);
      return new Image();
    }
  }

  async getById(id: number): Promise<Image> {
    try {
      const query = `
        SELECT i.*, 
               (SELECT COUNT(*) FROM likes l WHERE l.imageId = i.id) as likes,
               u.username, u.profileImage as userProfileImage,
               c.name as collectionName
        FROM images i
        LEFT JOIN users u ON i.userId = u.id
        LEFT JOIN collections c ON i.collectionId = c.id
        WHERE i.id = ?
      `;
      const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

      if (rows.length > 0) {
        const row = rows[0];
        const image = new Image(
          row.id,
          row.url,
          row.title,
          row.description,
          row.link,
          row.category,
          row.likes, // sada je COUNT iz likes tabele
          row.saves,
          row.userId,
          row.collectionId,
          row.createdAt,
          row.updatedAt
        );

        if (row.username) {
          image.user = {
            id: row.userId,
            username: row.username,
            profileImage: row.userProfileImage
          };
        }

        return image;
      }
      return new Image();
    } catch (error) {
      console.error('Error getting image by id:', error);
      return new Image();
    }
  }

  async getAll(page: number, limit: number, category?: string, search?: string): Promise<{ images: Image[], total: number }> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (category) {
        whereClause += ' AND i.category = ?';
        params.push(category);
      }

      if (search) {
        whereClause += ' AND (i.title LIKE ? OR i.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM images i ${whereClause}`;
      const [countRows] = await db.execute<RowDataPacket[]>(countQuery, params);
      const total = countRows[0].total;

      // Get paginated results
      const offset = (page - 1) * limit;
      const query = `
        SELECT i.*, 
               (SELECT COUNT(*) FROM likes l WHERE l.imageId = i.id) as likes,
               u.username, u.profileImage as userProfileImage
        FROM images i
        LEFT JOIN users u ON i.userId = u.id
        ${whereClause}
        ORDER BY i.createdAt DESC
        LIMIT ${offset}, ${limit}
      `;

      // Debug log (možeš ukloniti)
      console.log('\n----- GET ALL IMAGES DEBUG -----');
      console.log('Query:', query);
      console.log('Params:', params);
      console.log('page:', page, 'limit:', limit, 'offset:', offset, 'category:', category, 'search:', search);
      console.log('------------------------------\n');

      const [rows] = await db.execute<RowDataPacket[]>(query, params);

      const images = rows.map(row => {
        const image = new Image(
          row.id,
          row.url,
          row.title,
          row.description,
          row.link,
          row.category,
          row.likes, // sada je COUNT iz likes tabele
          row.saves,
          row.userId,
          row.collectionId,
          row.createdAt,
          row.updatedAt
        );

        if (row.username) {
          image.user = {
            id: row.userId,
            username: row.username,
            profileImage: row.userProfileImage
          };
        }

        return image;
      });

      return { images, total };
    } catch (error) {
      console.error('Error getting all images:', error);
      return { images: [], total: 0 };
    }
  }

  async getByUserId(userId: number, page: number, limit: number): Promise<{ images: Image[], total: number }> {
    try {
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM images WHERE userId = ?`;
      const [countRows] = await db.execute<RowDataPacket[]>(countQuery, [userId]);
      const total = countRows[0].total;

      // Get paginated results
      const offset = (page - 1) * limit;
      const query = `
        SELECT i.*, 
               (SELECT COUNT(*) FROM likes l WHERE l.imageId = i.id) as likes,
               u.username, u.profileImage as userProfileImage
        FROM images i
        LEFT JOIN users u ON i.userId = u.id
        WHERE i.userId = ?
        ORDER BY i.createdAt DESC
        LIMIT ${offset}, ${limit}
      `;

      const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);

      const images = rows.map(row => {
        const image = new Image(
          row.id,
          row.url,
          row.title,
          row.description,
          row.link,
          row.category,
          row.likes, // COUNT iz likes tabele
          row.saves,
          row.userId,
          row.collectionId,
          row.createdAt,
          row.updatedAt
        );

        if (row.username) {
          image.user = {
            id: row.userId,
            username: row.username,
            profileImage: row.userProfileImage
          };
        }

        return image;
      });

      return { images, total };
    } catch (error) {
      console.error('Error getting user images:', error);
      return { images: [], total: 0 };
    }
  }

  async getPopular(page: number, limit: number): Promise<{ images: Image[], total: number }> {
    try {
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM images`;
      const [countRows] = await db.execute<RowDataPacket[]>(countQuery);
      const total = countRows[0].total;

      // Get paginated results ordered by popularity
      const offset = (page - 1) * limit;
      const query = `
        SELECT i.*, 
               (SELECT COUNT(*) FROM likes l WHERE l.imageId = i.id) as likes,
               u.username, u.profileImage as userProfileImage
        FROM images i
        LEFT JOIN users u ON i.userId = u.id
        ORDER BY likes DESC, i.createdAt DESC
        LIMIT ${offset}, ${limit}
      `;

      const [rows] = await db.execute<RowDataPacket[]>(query);

      const images = rows.map(row => {
        const image = new Image(
          row.id,
          row.url,
          row.title,
          row.description,
          row.link,
          row.category,
          row.likes, // COUNT iz likes tabele
          row.saves,
          row.userId,
          row.collectionId,
          row.createdAt,
          row.updatedAt
        );

        if (row.username) {
          image.user = {
            id: row.userId,
            username: row.username,
            profileImage: row.userProfileImage
          };
        }

        return image;
      });

      return { images, total };
    } catch (error) {
      console.error('Error getting popular images:', error);
      return { images: [], total: 0 };
    }
  }

  async getByCollectionId(collectionId: number): Promise<Image[]> {
    try {
      const query = `
        SELECT i.*, 
               (SELECT COUNT(*) FROM likes l WHERE l.imageId = i.id) as likes,
               u.username, u.profileImage as userProfileImage
        FROM images i
        LEFT JOIN users u ON i.userId = u.id
        WHERE i.collectionId = ?
        ORDER BY i.createdAt DESC
        `;

      const [rows] = await db.execute<RowDataPacket[]>(query, [collectionId]);

      return rows.map(row => {
        const image = new Image(
          row.id,
          row.url,
          row.title,
          row.description,
          row.link,
          row.category,
          row.likes, // COUNT iz likes tabele
          row.saves,
          row.userId,
          row.collectionId,
          row.createdAt,
          row.updatedAt
        );

        if (row.username) {
          image.user = {
            id: row.userId,
            username: row.username,
            profileImage: row.userProfileImage
          };
        }

        return image;
      });
    } catch (error) {
      console.error('Error getting collection images:', error);
      return [];
    }
  }

  async update(image: Image): Promise<Image> {
    try {
      const query = `
        UPDATE images 
        SET title = ?, description = ?, link = ?, category = ?, collectionId = ?
        WHERE id = ?
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        image.title,
        image.description,
        image.link,
        image.category,
        image.collectionId,
        image.id
      ]);

      if (result.affectedRows > 0) {
        return image;
      }
      return new Image();
    } catch (error) {
      console.error('Error updating image:', error);
      return new Image();
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const query = `DELETE FROM images WHERE id = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  async incrementLikes(id: number): Promise<boolean> {
    return true;
  }

  async decrementLikes(id: number): Promise<boolean> {
    return true;
  }

  async incrementSaves(id: number): Promise<boolean> {
    try {
      const query = `UPDATE images SET saves = saves + 1 WHERE id = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error incrementing saves:', error);
      return false;
    }
  }

  async decrementSaves(id: number): Promise<boolean> {
    try {
      const query = `UPDATE images SET saves = GREATEST(saves - 1, 0) WHERE id = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error decrementing saves:', error);
      return false;
    }
  }
}
