export class User {
  id: number;
  username: string;
  email: string;
  profileImage: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number = 0,
    username: string = '',
    email: string = '',
    profileImage: string | null = null,
    bio: string | null = null,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.profileImage = profileImage;
    this.bio = bio;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
