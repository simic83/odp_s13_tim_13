import { ICollectionRepository } from "../../../Domain/repositories/collections/ICollectionRepository";
import { Collection } from "../../../Domain/models/Collection";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class CollectionRepository implements ICollectionRepository {
  async create(collection: Collection): Promise<Collection> {
    try {
      const query = `
        INSERT INTO collections (name, description, category, userId) 
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        collection.name,
        collection.description,
        collection.category,
        collection.userId
      ]);

      if (result.insertId) {
        collection.id = result.insertId;
        return collection;
      }
      return new Collection();
    } catch (error) {
      console.error('Error creating collection:', error);
      return new Collection();
    }
  }

  async getById(id: number): Promise<Collection> {
    try {
      const query = `
      SELECT c.*, u.username, u.profileImage as userProfileImage,
             (
               SELECT COUNT(DISTINCT imageId) 
               FROM (
                 SELECT id as imageId FROM images WHERE collectionId = c.id
                 UNION
                 SELECT imageId FROM user_saves WHERE collectionId = c.id
               ) as all_images
             ) as imagesCount,
             (
               SELECT url FROM images 
               WHERE id IN (
                 SELECT imageId FROM user_saves WHERE collectionId = c.id
                 UNION
                 SELECT id FROM images WHERE collectionId = c.id
               )
               ORDER BY createdAt DESC LIMIT 1
             ) as coverImage
      FROM collections c
      LEFT JOIN users u ON c.userId = u.id
      WHERE c.id = ?
    `;
      const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

      if (rows.length > 0) {
        const row = rows[0];
        const collection = new Collection(
          row.id,
          row.name,
          row.description,
          row.category,
          row.userId,
          row.createdAt,
          row.updatedAt
        );

        collection.user = {
          id: row.userId,
          username: row.username,
          profileImage: row.userProfileImage
        };
        collection.imagesCount = row.imagesCount;
        collection.coverImage = row.coverImage;

        return collection;
      }
      return new Collection();
    } catch (error) {
      console.error('Error getting collection by id:', error);
      return new Collection();
    }
  }

  // 2. Ispravka za getByUserId metodu:
  async getByUserId(userId: number): Promise<Collection[]> {
    try {
      const query = `
      SELECT c.*,
             (
               SELECT COUNT(DISTINCT imageId) 
               FROM (
                 SELECT id as imageId FROM images WHERE collectionId = c.id
                 UNION
                 SELECT imageId FROM user_saves WHERE collectionId = c.id
               ) as all_images
             ) as imagesCount,
             (
               SELECT url FROM images 
               WHERE id IN (
                 SELECT imageId FROM user_saves WHERE collectionId = c.id
                 UNION
                 SELECT id FROM images WHERE collectionId = c.id
               )
               ORDER BY createdAt DESC LIMIT 1
             ) as coverImage
      FROM collections c
      WHERE c.userId = ?
      ORDER BY c.createdAt DESC
    `;
      const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);

      return rows.map(row => {
        const collection = new Collection(
          row.id,
          row.name,
          row.description,
          row.category,
          row.userId,
          row.createdAt,
          row.updatedAt
        );

        collection.imagesCount = row.imagesCount;
        collection.coverImage = row.coverImage;

        return collection;
      });
    } catch (error) {
      console.error('Error getting user collections:', error);
      return [];
    }
  }

  // 3. Ispravka za getAll metodu:
  async getAll(page: number, limit: number, userId?: number): Promise<{ collections: Collection[], total: number }> {
    try {
      // WHERE klauzula
      let whereClause = '';
      const whereParams: any[] = [];
      if (userId !== undefined && userId !== null) {
        whereClause = 'WHERE c.userId = ?';
        whereParams.push(Number(userId));
      }

      // COUNT query
      const countQuery = `SELECT COUNT(*) as total FROM collections c ${whereClause}`;
      const [countRows] = await db.execute<RowDataPacket[]>(countQuery, whereParams);
      const total = Number(countRows[0]?.total ?? 0);

      // Paginacija
      const pageNum = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
      const limitNum = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 20;
      const offsetNum = (pageNum - 1) * limitNum;

      // Glavni query sa ispravkama za brojanje slika
      const dataQuery = `
      SELECT c.*, u.username, u.profileImage as userProfileImage,
             (
               SELECT COUNT(DISTINCT imageId) 
               FROM (
                 SELECT id as imageId FROM images WHERE collectionId = c.id
                 UNION
                 SELECT imageId FROM user_saves WHERE collectionId = c.id
               ) as all_images
             ) as imagesCount,
             (
               SELECT url FROM images 
               WHERE id IN (
                 SELECT imageId FROM user_saves WHERE collectionId = c.id
                 UNION
                 SELECT id FROM images WHERE collectionId = c.id
               )
               ORDER BY createdAt DESC LIMIT 1
             ) as coverImage
      FROM collections c
      LEFT JOIN users u ON c.userId = u.id
      ${whereClause}
      ORDER BY c.createdAt DESC
      LIMIT ${offsetNum}, ${limitNum}
    `;

      const [rows] = await db.execute<RowDataPacket[]>(dataQuery, whereParams);

      const collections = rows.map(row => {
        const collection = new Collection(
          row.id,
          row.name,
          row.description,
          row.category,
          row.userId,
          row.createdAt,
          row.updatedAt
        );

        collection.user = {
          id: row.userId,
          username: row.username,
          profileImage: row.userProfileImage
        };
        collection.imagesCount = row.imagesCount;
        collection.coverImage = row.coverImage;

        return collection;
      });

      return { collections, total };
    } catch (error) {
      console.error('Error getting all collections:', error);
      return { collections: [], total: 0 };
    }
  }

  

  async update(collection: Collection): Promise<Collection> {
    try {
      const query = `
        UPDATE collections 
        SET name = ?, description = ?, category = ?
        WHERE id = ?
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        collection.name,
        collection.description,
        collection.category,
        collection.id
      ]);

      if (result.affectedRows > 0) {
        return collection;
      }
      return new Collection();
    } catch (error) {
      console.error('Error updating collection:', error);
      return new Collection();
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const query = `DELETE FROM collections WHERE id = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting collection:', error);
      return false;
    }
  }
}
