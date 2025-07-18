export class Collection {
  public constructor(
    public id: number = 0,
    public name: string = '',
    public description: string | null = null,
    public category: string = '',
    public userId: number = 0,
    public createdAt?: Date,
    public updatedAt?: Date,
    // Virtual properties
    public user?: any,
    public imagesCount?: number,
    public coverImage?: string
  ) {}
}