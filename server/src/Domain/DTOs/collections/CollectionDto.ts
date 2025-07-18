export interface CollectionDto {
  id: string;
  name: string;
  description?: string;
  category: string;
  coverImage?: string;
  userId: string;
  user?: {
    id: string;
    username: string;
  };
  imagesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}