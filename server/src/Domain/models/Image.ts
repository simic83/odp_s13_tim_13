export class Image {
  public constructor(
    public id: number = 0,
    public url: string = '',
    public title: string = '',
    public description: string | null = null,
    public link: string | null = null,
    public category: string = '',
    public likes: number = 0,
    public saves: number = 0,
    public userId: number = 0,
    public collectionId: number | null = null,
    public createdAt?: Date,
    public updatedAt?: Date,
    // Virtual properties
    public user?: any,
    public isLiked?: boolean,
    public isSaved?: boolean
  ) {}
}