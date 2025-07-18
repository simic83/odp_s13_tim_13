import { User } from './User';

export class Comment {
  id: number;
  content: string;
  userId: number;
  imageId: number;
  createdAt: Date;
  user?: User;

  constructor(
    id: number = 0,
    content: string = '',
    userId: number = 0,
    imageId: number = 0,
    createdAt: Date = new Date(),
    user?: User
  ) {
    this.id = id;
    this.content = content;
    this.userId = userId;
    this.imageId = imageId;
    this.createdAt = createdAt;
    this.user = user;
  }
}
