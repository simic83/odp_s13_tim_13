export class Comment {
  public constructor(
    public id: number = 0,
    public content: string = '',
    public userId: number = 0,
    public imageId: number = 0,
    public createdAt?: Date,
    // Virtual properties
    public user?: any
  ) {}
}