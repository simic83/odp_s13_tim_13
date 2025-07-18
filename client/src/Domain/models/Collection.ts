import { User } from './User';
import { Image } from './Image';

export class Collection {
  id: number;
  name: string;
  description: string | null;
  category: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  imagesCount: number;
  coverImage: string;
  images: Image[];

  constructor(
    id: number = 0,
    name: string = '',
    description: string | null = null,
    category: string = '',
    userId: number = 0,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    user?: User,
    imagesCount: number = 0,
    coverImage: string = '',
    images: Image[] = []
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category = category;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.user = user;
    this.imagesCount = imagesCount;
    this.coverImage = coverImage;
    this.images = images;
  }
}
