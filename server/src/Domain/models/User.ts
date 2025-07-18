export class User {
  public constructor(
    public id: number = 0,
    public username: string = '',
    public email: string = '',
    public password: string = '',
    public profileImage: string | null = null,
    public bio: string | null = null,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}