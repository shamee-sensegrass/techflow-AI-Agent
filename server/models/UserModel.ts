import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, type User, type InsertUser } from "../../shared/schema";

export class UserModel {
  // Find user by ID
  static async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  // Find user by username
  static async findByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  // Create new user
  static async create(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Update user
  static async update(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Delete user
  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  // Validate user credentials
  static async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    // In a real application, you would hash the password and compare
    // For now, we'll do a simple comparison
    if (user.password === password) {
      return user;
    }
    return null;
  }

  // Get user profile data (excluding sensitive info)
  static async getProfile(id: number): Promise<Omit<User, 'password'> | undefined> {
    const user = await this.findById(id);
    if (!user) return undefined;
    
    const { password, ...profile } = user;
    return profile;
  }

  // Check if email exists
  static async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user;
  }

  // Check if username exists
  static async usernameExists(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return !!user;
  }
}