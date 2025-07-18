import { Collection } from '../../Domain/models/Collection';
import { ICollectionService } from '../../Domain/services/collections/ICollectionService';
import { ICollectionRepository } from '../../Domain/repositories/collections/ICollectionRepository';

export class CollectionService implements ICollectionService {
  constructor(private collectionRepository: ICollectionRepository) {}

  async getCollections(options: {
    page: number;
    limit: number;
    userId?: string;
  }): Promise<{ collections: Collection[]; total: number; hasMore: boolean }> {
    // Promeni na getAll
    const { collections, total } = await this.collectionRepository.getAll(
      options.page,
      options.limit,
      options.userId ? Number(options.userId) : undefined
    );
    const hasMore = options.page * options.limit < total;

    return { collections, total, hasMore };
  }

  async getUserCollections(userId: string): Promise<Collection[]> {
    // Promeni na getByUserId
    return await this.collectionRepository.getByUserId(Number(userId));
  }

  async getCollectionById(id: string): Promise<Collection | null> {
    // Promeni na getById
    return await this.collectionRepository.getById(Number(id));
  }

  async createCollection(data: {
    name: string;
    description?: string;
    category: string;
    userId: string;
  }): Promise<Collection> {
    // Prosledi kompletan objekat ako je potrebno, ili menjaš repozitorijum da prima partial podatke
    return await this.collectionRepository.create({
      name: data.name,
      description: data.description,
      category: data.category,
      userId: Number(data.userId),
      id: 0, // ili undefined, ako konstruktor dozvoljava
      createdAt: undefined,
      updatedAt: undefined,
    } as Collection);
  }

  async updateCollection(id: string, userId: string, data: {
    name?: string;
    description?: string;
    category?: string;
  }): Promise<Collection | null> {
    // Verify ownership
    const collection = await this.collectionRepository.getById(Number(id));
    if (!collection || collection.userId !== Number(userId)) {
      return null;
    }
    // Repo update najverovatnije očekuje Collection objekat, ili možeš modifikovati podatke i proslediti
    // (Ako ne, menjaš implementaciju repozitorijuma)
    Object.assign(collection, data);
    return await this.collectionRepository.update(collection);
  }

  async deleteCollection(id: string, userId: string): Promise<boolean> {
    // Verify ownership
    const collection = await this.collectionRepository.getById(Number(id));
    if (!collection || collection.userId !== Number(userId)) {
      return false;
    }
    return await this.collectionRepository.delete(Number(id));
  }
}
