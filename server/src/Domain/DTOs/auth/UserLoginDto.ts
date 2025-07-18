export class UserLoginDto {
  public constructor(
    public id: number = 0,
    public username: string = '',
    public email: string = '',
    public token: string = ''
  ) {}
}