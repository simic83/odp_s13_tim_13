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
               COUNT(i.id) as imagesCount,
               (SELECT url FROM images WHERE collectionId = c.id ORDER BY createdAt DESC LIMIT 1) as coverImage
        FROM collections c
        LEFT JOIN users u ON c.userId = u.id
        LEFT JOIN images i ON c.id = i.collectionId
        WHERE c.id = ?
        GROUP BY c.id
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

  async getByUserId(userId: number): Promise<Collection[]> {
    try {
      const query = `
        SELECT c.*,
               COUNT(i.id) as imagesCount,
               (SELECT url FROM images WHERE collectionId = c.id ORDER BY createdAt DESC LIMIT 1) as coverImage
        FROM collections c
        LEFT JOIN images i ON c.id = i.collectionId
        WHERE c.userId = ?
        GROUP BY c.id
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

  async getAll(page: number, limit: number, userId?: number): Promise<{ collections: Collection[], total: number }> {
    try {
      // WHERE
      let whereClause = '';
      const whereParams: any[] = [];
      if (userId !== undefined && userId !== null) {
        whereClause = 'WHERE c.userId = ?';
        whereParams.push(Number(userId));
      }

      // COUNT
      const countQuery = `SELECT COUNT(*) as total FROM collections c ${whereClause}`;
      const [countRows] = await db.execute<RowDataPacket[]>(countQuery, whereParams);
      const total = Number(countRows[0]?.total ?? 0);

      // PAGINACIJA — striktni brojevi
      const pageNum = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
      const limitNum = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 20;
      const offsetNum = (pageNum - 1) * limitNum;

      // GLAVNI UPIT — direktno ubaceni brojevi u LIMIT (nema placeholdera za njih!)
      const dataQuery = `
        SELECT c.*, u.username, u.profileImage as userProfileImage,
               COUNT(i.id) as imagesCount,
               (SELECT url FROM images WHERE collectionId = c.id ORDER BY createdAt DESC LIMIT 1) as coverImage
        FROM collections c
        LEFT JOIN users u ON c.userId = u.id
        LEFT JOIN images i ON c.id = i.collectionId
        ${whereClause}
        GROUP BY c.id
        ORDER BY c.createdAt DESC
        LIMIT ${offsetNum}, ${limitNum}
      `;

      // ⚠️ Važno: pošto u upitu NEMA placeholdera za offset/limit,
      // u execute prosleđujemo SAMO whereParams (npr. userId) — ništa više.
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
