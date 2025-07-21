import { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';

export class UserController {
  // Get user profile
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await UserModel.getProfile(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update user profile
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const updates = req.body;
      
      // Remove sensitive fields that shouldn't be updated this way
      delete updates.password;
      delete updates.id;
      delete updates.createdAt;

      const updatedUser = await UserModel.update(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Change password
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      // Get current user
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      if (user.password !== currentPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Update password
      const updatedUser = await UserModel.update(userId, { password: newPassword });
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete user account
  static async deleteAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: 'Password confirmation required' });
      }

      // Verify password
      const user = await UserModel.findById(userId);
      if (!user || user.password !== password) {
        return res.status(400).json({ error: 'Invalid password' });
      }

      // Delete user
      const deleted = await UserModel.delete(userId);
      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Destroy session
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
      });

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}