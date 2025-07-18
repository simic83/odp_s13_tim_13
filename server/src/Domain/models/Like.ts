export class Like {
  public constructor(
    public id: number = 0,
    public userId: number = 0,
    public imageId: number = 0,
    public createdAt?: Date
  ) {}
}