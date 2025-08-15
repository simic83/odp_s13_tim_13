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
               (SELECT COUNT(*) FROM user_saves us WHERE us.imageId = i.id) as saves,
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
          row.likes,
          row.saves, // sada je COUNT iz user_saves tabele
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

  async getAll(page: number, limit: number, category?: string, search?: string, userId?: number): Promise<{ images: Image[], total: number }> {
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
               (SELECT COUNT(*) FROM user_saves us WHERE us.imageId = i.id) as saves,
               u.username, u.profileImage as userProfileImage
               ${userId ? ', (SELECT COUNT(*) FROM likes WHERE imageId = i.id AND userId = ?) as userLiked' : ''}
               ${userId ? ', (SELECT COUNT(*) FROM user_saves WHERE imageId = i.id AND userId = ?) as userSaved' : ''}
        FROM images i
        LEFT JOIN users u ON i.userId = u.id
        ${whereClause}
        ORDER BY i.createdAt DESC
        LIMIT ${offset}, ${limit}
      `;

      // Add userId to params if provided
      const queryParams = userId ? [userId, userId, ...params] : params;

      const [rows] = await db.execute<RowDataPacket[]>(query, queryParams);

      const images = rows.map(row => {
        const image = new Image(
          row.id,
          row.url,
          row.title,
          row.description,
          row.link,
          row.category,
          row.likes,
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

        // Set isLiked and isSaved if userId was provided
        if (userId) {
          image.isLiked = row.userLiked > 0;
          image.isSaved = row.userSaved > 0;
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
               (SELECT COUNT(*) FROM user_saves us WHERE us.imageId = i.id) as saves,
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
          row.likes,
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

  async getPopular(page: number, limit: number, sortType: string = 'likes', userId?: number): Promise<{ images: Image[], total: number }> {
    try {
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM images`;
      const [countRows] = await db.execute<RowDataPacket[]>(countQuery);
      const total = countRows[0].total;

      // Get paginated results with dynamic sorting
      const offset = (page - 1) * limit;

      let orderByClause = '';

      switch (sortType) {
        case 'likes':
          // Sort by likes only
          orderByClause = `ORDER BY (SELECT COUNT(*) FROM likes l WHERE l.imageId = i.id) DESC, i.createdAt DESC`;
          break;

        case 'saves':
          // Sort by saves only
          orderByClause = `ORDER BY (SELECT COUNT(*) FROM user_saves us WHERE us.imageId = i.id) DESC, i.createdAt DESC`;
          break;

        case 'trending':
          // Formula for trending: (likes + saves*2) / (days_old + 1)
          // This gives higher weight to newer content with engagement
          orderByClause = `
          ORDER BY (
            ((SELECT COUNT(*) FROM likes l WHERE l.imageId = i.id) + 
             (SELECT COUNT(*) FROM user_saves us WHERE us.imageId = i.id) * 2) 
            / (DATEDIFF(NOW(), i.createdAt) + 1)
          ) DESC, i.createdAt DESC
        `;
          break;

        default:
          // Default to likes
          orderByClause = `ORDER BY (SELECT COUNT(*) FROM likes l WHERE l.imageId = i.id) DESC, i.createdAt DESC`;
      }

      const query = `
      SELECT i.*, 
             (SELECT COUNT(*) FROM likes l WHERE l.imageId = i.id) as likes,
             (SELECT COUNT(*) FROM user_saves us WHERE us.imageId = i.id) as saves,
             u.username, u.profileImage as userProfileImage
             ${userId ? ', (SELECT COUNT(*) FROM likes WHERE imageId = i.id AND userId = ?) as userLiked' : ''}
             ${userId ? ', (SELECT COUNT(*) FROM user_saves WHERE imageId = i.id AND userId = ?) as userSaved' : ''}
      FROM images i
      LEFT JOIN users u ON i.userId = u.id
      ${orderByClause}
      LIMIT ${offset}, ${limit}
    `;

      // Add userId to params if provided
      const queryParams = userId ? [userId, userId] : [];
      const [rows] = await db.execute<RowDataPacket[]>(query, queryParams);

      const images = rows.map(row => {
        const image = new Image(
          row.id,
          row.url,
          row.title,
          row.description,
          row.link,
          row.category,
          row.likes,
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

        // Set isLiked and isSaved if userId was provided
        if (userId) {
          image.isLiked = row.userLiked > 0;
          image.isSaved = row.userSaved > 0;
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
      // Query koji uzima slike koje su sačuvane u kolekciju ILI koje su originalno kreirane u toj kolekciji
      const query = `
      SELECT DISTINCT i.*, 
             (SELECT COUNT(*) FROM likes l WHERE l.imageId = i.id) as likes,
             (SELECT COUNT(*) FROM user_saves us WHERE us.imageId = i.id) as saves,
             u.username, u.profileImage as userProfileImage
      FROM images i
      LEFT JOIN users u ON i.userId = u.id
      WHERE i.id IN (
        SELECT imageId FROM user_saves WHERE collectionId = ?
        UNION
        SELECT id FROM images WHERE collectionId = ?
      )
      ORDER BY i.createdAt DESC
    `;

      const [rows] = await db.execute<RowDataPacket[]>(query, [collectionId, collectionId]);

      return rows.map(row => {
        const image = new Image(
          row.id,
          row.url,
          row.title,
          row.description,
          row.link,
          row.category,
          row.likes,
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
    // Likes se čuvaju u likes tabeli, ne u images tabeli
    return true;
  }

  async decrementLikes(id: number): Promise<boolean> {
    // Likes se čuvaju u likes tabeli, ne u images tabeli
    return true;
  }

  async incrementSaves(id: number): Promise<boolean> {
    // Saves se čuvaju u user_saves tabeli, ne u images tabeli
    return true;
  }

  async decrementSaves(id: number): Promise<boolean> {
    // Saves se čuvaju u user_saves tabeli, ne u images tabeli
    return true;
  }
}