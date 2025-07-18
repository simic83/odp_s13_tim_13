export class UserRegisterDto {
  public constructor(
    public username: string = '',
    public email: string = '',
    public password: string = ''
  ) {}
}