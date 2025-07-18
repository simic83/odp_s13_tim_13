export interface ImageDto {
  id: string;
  url: string;
  title: string;
  description?: string;
  link?: string;
  category: string;
  likes: number;
  saves: number;
  userId: string;
  user?: {
    id: string;
    username: string;
    profileImage?: string;
  };
  collectionId?: string;
  collection?: {
    id: string;
    name: string;
  };
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: Date;
  updatedAt: Date;
}