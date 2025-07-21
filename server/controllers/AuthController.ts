import { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';
import { insertUserSchema, loginSchema } from '../../shared/schema';
import { z } from 'zod';

export class AuthController {
  // User registration
  static async register(req: Request, res: Response) {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Check username availability
      if (validatedData.username) {
        const existingUsername = await UserModel.findByUsername(validatedData.username);
        if (existingUsername) {
          return res.status(400).json({ error: 'Username already taken' });
        }
      }

      // Create user
      const user = await UserModel.create(validatedData);
      const { password, ...userWithoutPassword } = user;

      // Set session
      req.session.userId = user.id;

      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // User login
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // Validate credentials
      const user = await UserModel.validateCredentials(email, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Set session
      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // User logout
  static async logout(req: Request, res: Response) {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get current user
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await UserModel.getProfile(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Check authentication status
  static async checkAuth(req: Request, res: Response) {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.json({ authenticated: false });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.json({ authenticated: false });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ 
        authenticated: true, 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error('Check auth error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}