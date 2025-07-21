import { Request, Response } from 'express';
import { ContactModel } from '../models/ContactModel';
import { insertContactSchema } from '../../shared/schema';
import { z } from 'zod';

export class ContactController {
  // Create new contact submission
  static async createContact(req: Request, res: Response) {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      
      const contact = await ContactModel.create(validatedData);
      
      res.status(201).json({ 
        message: 'Contact submission received successfully',
        contact 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      console.error('Create contact error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all contacts (admin only - would need role-based auth in production)
  static async getContacts(req: Request, res: Response) {
    try {
      const contacts = await ContactModel.findAll();
      res.json(contacts);
    } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get recent contacts
  static async getRecentContacts(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const contacts = await ContactModel.getRecent(limit);
      res.json(contacts);
    } catch (error) {
      console.error('Get recent contacts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}