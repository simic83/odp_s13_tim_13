export interface CreateImageDto {
  title: string;
  description?: string;
  link?: string;
  category: string;
  collectionId?: string;
}