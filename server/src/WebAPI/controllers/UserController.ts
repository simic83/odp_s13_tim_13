import { Response, Router } from 'express';
import { UserRepository } from '../../Database/repositories/users/UserRepository';
import type { AuthRequest } from '../middlewares/AuthMiddleware';

export class UserController {
  private userRepository: UserRepository;
  private router: Router;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/:id', this.getProfile.bind(this));
    this.router.put('/:id', this.updateProfile.bind(this));
  }

  public getRouter(): Router {
    return this.router;
  }

  public async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = Number(req.params.id); // ISPRAVKA ovde
      const user = await this.userRepository.getById(userId);

      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      const { password, ...userWithoutPassword } = user as any;

      res.json({ success: true, data: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  public async updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const reqUserId = Number(req.user.id);
    const paramUserId = Number(req.params.id);

    if (reqUserId !== paramUserId) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const { username, bio, profileImage } = req.body;

    if (username && username !== req.user.username) {
      const existingUser = await this.userRepository.getByUsername(username);
      if (existingUser) {
        res.status(400).json({ success: false, error: 'Username already taken' });
        return;
      }
    }

    const currentUser = await this.userRepository.getById(reqUserId);
    if (!currentUser) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const updatedUser = {
      ...currentUser,
      username: username ?? currentUser.username,
      bio: bio ?? currentUser.bio,
      profileImage: profileImage ?? currentUser.profileImage,
    };

    await this.userRepository.update(updatedUser);

    // Osveži iz baze bez password-a
    const refreshedUser = await this.userRepository.getById(reqUserId);
    const { password, ...userWithoutPassword } = refreshedUser as any;

    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

}
