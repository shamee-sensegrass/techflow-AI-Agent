import { db } from "../db";
import { contacts, type Contact, type InsertContact } from "../../shared/schema";

export class ContactModel {
  // Get all contacts
  static async findAll(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  // Create new contact
  static async create(contactData: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(contactData)
      .returning();
    return contact;
  }

  // Find contact by email
  static async findByEmail(email: string): Promise<Contact | undefined> {
    const allContacts = await this.findAll();
    return allContacts.find(contact => contact.email === email);
  }

  // Get contacts by type
  static async findByType(type: string): Promise<Contact[]> {
    const allContacts = await this.findAll();
    return allContacts.filter(contact => contact.subject?.includes(type));
  }

  // Get recent contacts
  static async getRecent(limit: number = 10): Promise<Contact[]> {
    const allContacts = await this.findAll();
    return allContacts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}