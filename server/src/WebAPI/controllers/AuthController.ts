import { Request, Response, Router } from 'express';
import { IAuthService } from '../../Domain/services/auth/IAuthService';
import { validateAuthData, validateLoginData } from '../validators/auth/authValidators';
import { UserRegisterDto } from '../../Domain/DTOs/auth/UserRegisterDto';
import { AuthRequest } from '../middlewares/AuthMiddleware';

export class AuthController {
  private router: Router;
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.router = Router();
    this.authService = authService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
  this.router.post('/login', this.login.bind(this));
  this.router.post('/register', this.register.bind(this));
  this.router.get('/me', this.me.bind(this));
}

  private async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const validation = validateLoginData(email, password);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.authService.login(email, password);
      
      if (result.id !== 0) {
        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: result
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  private async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      
      const validation = validateAuthData(username, email, password);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const registerDto = new UserRegisterDto(username, email, password);
      const result = await this.authService.register(registerDto);
      
      if (result.id !== 0) {
        res.status(201).json({
          success: true,
          message: 'Registration successful',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Registration failed. Username or email already exists.'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  private async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'No token provided'
        });
        return;
      }

      const user = await this.authService.validateToken(token);
      
      if (user) {
        res.status(200).json({
          success: true,
          data: {
            ...user,
            token
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
    } catch (error) {
      console.error('Me error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}