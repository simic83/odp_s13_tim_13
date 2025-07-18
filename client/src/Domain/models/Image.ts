import { User } from './User';

export class Image {
  id: number;
  url: string;
  title: string;
  description: string | null;
  link: string | null;
  category: string;
  likes: number;
  saves: number;
  userId: number;
  collectionId: number | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  isLiked?: boolean;
  isSaved?: boolean;

  constructor(
    id: number = 0,
    url: string = '',
    title: string = '',
    description: string | null = null,
    link: string | null = null,
    category: string = '',
    likes: number = 0,
    saves: number = 0,
    userId: number = 0,
    collectionId: number | null = null,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    user?: User,
    isLiked?: boolean,
    isSaved?: boolean
  ) {
    this.id = id;
    this.url = url;
    this.title = title;
    this.description = description;
    this.link = link;
    this.category = category;
    this.likes = likes;
    this.saves = saves;
    this.userId = userId;
    this.collectionId = collectionId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.user = user;
    this.isLiked = isLiked;
    this.isSaved = isSaved;
  }
}
