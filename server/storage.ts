import { 
  users, 
  newsletterSubscribers, 
  resourceDownloads,
  type User, 
  type RegisterUserInput,
  type UpdateProfileInput,
  type NewsletterSubscriber,
  type NewsletterSubscriberInput,
  type ResourceDownload,
  type ResourceDownloadInput
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IStorage {
  // User authentication and profile
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  registerUser(userData: RegisterUserInput): Promise<User>;
  verifyUser(email: string, verificationToken: string): Promise<boolean>;
  updateUserProfile(userId: number, profileData: UpdateProfileInput): Promise<User>;
  validateUserCredentials(email: string, password: string): Promise<User | null>;
  generateResetToken(email: string): Promise<string | null>;
  resetPassword(email: string, token: string, newPassword: string): Promise<boolean>;
  
  // Partner applications
  submitPartnerApplication(partnerData: PartnerApplicationInput): Promise<User>;
  
  // Newsletter subscribers
  addNewsletterSubscriber(subscriberData: NewsletterSubscriberInput): Promise<NewsletterSubscriber>;
  removeNewsletterSubscriber(email: string): Promise<boolean>;
  
  // Resource downloads
  trackResourceDownload(downloadData: ResourceDownloadInput): Promise<ResourceDownload>;
  getResourceDownloadsByEmail(email: string): Promise<ResourceDownload[]>;
}

export class DatabaseStorage implements IStorage {
  // User authentication and profile
  async getUserById(id: number | undefined): Promise<User | undefined> {
    if (!id) return undefined;
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async registerUser(userData: RegisterUserInput): Promise<User> {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Insert the user
    const [user] = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
      verificationToken,
    }).returning();
    
    return user;
  }
  
  async verifyUser(email: string, verificationToken: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(
      and(
        eq(users.email, email),
        eq(users.verificationToken, verificationToken)
      )
    );
    
    if (!user) return false;
    
    await db.update(users)
      .set({ 
        isVerified: true, 
        verificationToken: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));
      
    return true;
  }
  
  async updateUserProfile(userId: number | undefined, profileData: UpdateProfileInput): Promise<User> {
    if (!userId) {
      throw new Error('User ID is required to update profile');
    }
    
    const [updatedUser] = await db.update(users)
      .set({
        ...profileData,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
  
  async validateUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    
    return isValid ? user : null;
  }
  
  async generateResetToken(email: string): Promise<string | null> {
    const user = await this.getUserByEmail(email);
    
    if (!user) return null;
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    await db.update(users)
      .set({ 
        resetPasswordToken: resetToken,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));
      
    return resetToken;
  }
  
  async resetPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(
      and(
        eq(users.email, email),
        eq(users.resetPasswordToken, token)
      )
    );
    
    if (!user) return false;
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db.update(users)
      .set({ 
        password: hashedPassword,
        resetPasswordToken: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));
      
    return true;
  }
  
  // Newsletter subscribers
  async addNewsletterSubscriber(subscriberData: NewsletterSubscriberInput): Promise<NewsletterSubscriber> {
    // First check if the user exists in the users table
    const user = await this.getUserByEmail(subscriberData.email);
    
    if (user) {
      // Update the existing user to be subscribed to newsletter
      await db.update(users)
        .set({ 
          isSubscribedToNewsletter: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      // Return a subscriber-like object using the user data
      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      };
    }
    
    // Otherwise create a new subscriber
    try {
      const [subscriber] = await db.insert(newsletterSubscribers)
        .values(subscriberData)
        .returning();
      
      return subscriber;
    } catch (error) {
      // If the subscriber already exists, just return them
      const [existingSubscriber] = await db.select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, subscriberData.email));
      
      return existingSubscriber;
    }
  }
  
  async removeNewsletterSubscriber(email: string): Promise<boolean> {
    // Check for and update user
    const user = await this.getUserByEmail(email);
    
    if (user) {
      await db.update(users)
        .set({ 
          isSubscribedToNewsletter: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
    }
    
    // Delete from subscribers table
    await db.delete(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email));
    
    return true;
  }
  
  // Resource downloads
  async trackResourceDownload(downloadData: ResourceDownloadInput): Promise<ResourceDownload> {
    const [download] = await db.insert(resourceDownloads)
      .values(downloadData)
      .returning();
    
    return download;
  }
  
  async getResourceDownloadsByEmail(email: string): Promise<ResourceDownload[]> {
    return await db.select()
      .from(resourceDownloads)
      .where(eq(resourceDownloads.email, email));
  }
}

export const storage = new DatabaseStorage();
