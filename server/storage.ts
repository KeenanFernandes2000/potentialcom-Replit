import { 
  users, 
  newsletterSubscribers, 
  resourceDownloads,
  coaches,
  coachingSessions,
  userPoints,
  type User, 
  type RegisterUserInput,
  type UpdateProfileInput,
  type NewsletterSubscriber,
  type NewsletterSubscriberInput,
  type ResourceDownload,
  type ResourceDownloadInput,
  type PartnerApplicationInput,
  type Coach,
  type CoachInput,
  type CoachingSession,
  type CoachingSessionInput,
  type UserPoints,
  type UserPointsInput
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
  
  // Coaching experts and sessions
  createCoach(coachData: CoachInput, userId?: number): Promise<Coach>;
  updateCoach(coachId: number, coachData: Partial<CoachInput>): Promise<Coach>;
  getCoachById(id: number): Promise<Coach | undefined>;
  getAllCoaches(activeOnly?: boolean): Promise<Coach[]>;
  getCoachesByExpertise(expertise: string, activeOnly?: boolean): Promise<Coach[]>;
  
  // Coaching sessions
  createCoachingSession(sessionData: CoachingSessionInput): Promise<CoachingSession>;
  updateCoachingSession(sessionId: number, sessionData: Partial<CoachingSessionInput>): Promise<CoachingSession>;
  getCoachingSessionById(id: number): Promise<CoachingSession | undefined>;
  getUserCoachingSessions(userId: number): Promise<CoachingSession[]>;
  getCoachCoachingSessions(coachId: number): Promise<CoachingSession[]>;
  
  // User points
  getUserPoints(userId: number): Promise<UserPoints | undefined>;
  addUserPoints(userId: number, points: number): Promise<UserPoints>;
  useUserPoints(userId: number, points: number): Promise<UserPoints>;
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
  
  // Partner applications
  async submitPartnerApplication(partnerData: PartnerApplicationInput): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(partnerData.email);
    
    if (existingUser) {
      // Update existing user with partner information and role
      const [updatedUser] = await db
        .update(users)
        .set({
          firstName: partnerData.firstName,
          lastName: partnerData.lastName,
          phoneNumber: partnerData.phoneNumber,
          jobTitle: partnerData.jobTitle,
          companyName: partnerData.companyName,
          companyWebsite: partnerData.companyWebsite,
          companySize: partnerData.companySize,
          partnerReason: partnerData.partnerReason,
          role: 'partner',
          isSubscribedToNewsletter: partnerData.isSubscribedToNewsletter,
          updatedAt: new Date()
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      
      return updatedUser;
    } else {
      // Create a temporary password for the new user
      const temporaryPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
      
      // Create a new user with partner role
      const [newUser] = await db
        .insert(users)
        .values({
          email: partnerData.email,
          password: hashedPassword,
          firstName: partnerData.firstName,
          lastName: partnerData.lastName,
          phoneNumber: partnerData.phoneNumber,
          jobTitle: partnerData.jobTitle,
          companyName: partnerData.companyName,
          companyWebsite: partnerData.companyWebsite,
          companySize: partnerData.companySize,
          partnerReason: partnerData.partnerReason,
          role: 'partner',
          isSubscribedToNewsletter: partnerData.isSubscribedToNewsletter,
          // Generate a verification token
          verificationToken: crypto.randomBytes(32).toString('hex')
        })
        .returning();
      
      // TODO: Send verification email with temporary password
      
      return newUser;
    }
  }

  // Coaching experts methods
  async createCoach(coachData: CoachInput, userId?: number): Promise<Coach> {
    try {
      const [coach] = await db.insert(coaches).values({
        ...coachData,
        userId: userId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return coach;
    } catch (error) {
      console.error("Error creating coach:", error);
      throw new Error("Failed to create coach");
    }
  }

  async updateCoach(coachId: number, coachData: Partial<CoachInput>): Promise<Coach> {
    try {
      const [updatedCoach] = await db
        .update(coaches)
        .set({
          ...coachData,
          updatedAt: new Date(),
        })
        .where(eq(coaches.id, coachId))
        .returning();
      
      if (!updatedCoach) {
        throw new Error(`Coach with ID ${coachId} not found`);
      }
      
      return updatedCoach;
    } catch (error) {
      console.error("Error updating coach:", error);
      throw new Error("Failed to update coach");
    }
  }

  async getCoachById(id: number): Promise<Coach | undefined> {
    try {
      const [coach] = await db
        .select()
        .from(coaches)
        .where(eq(coaches.id, id));
      
      return coach;
    } catch (error) {
      console.error("Error getting coach by ID:", error);
      return undefined;
    }
  }

  async getAllCoaches(activeOnly: boolean = true): Promise<Coach[]> {
    try {
      let query = db.select().from(coaches);
      
      if (activeOnly) {
        query = query.where(eq(coaches.isActive, true));
      }
      
      return await query;
    } catch (error) {
      console.error("Error getting all coaches:", error);
      return [];
    }
  }

  async getCoachesByExpertise(expertise: string, activeOnly: boolean = true): Promise<Coach[]> {
    try {
      let query = db
        .select()
        .from(coaches)
        .where(eq(coaches.expertise, expertise));
      
      if (activeOnly) {
        query = query.where(eq(coaches.isActive, true));
      }
      
      return await query;
    } catch (error) {
      console.error("Error getting coaches by expertise:", error);
      return [];
    }
  }

  // Coaching sessions methods
  async createCoachingSession(sessionData: CoachingSessionInput): Promise<CoachingSession> {
    try {
      // If using points, verify user has enough points
      if (sessionData.sessionType === 'points' && sessionData.pointsUsed) {
        const userPointsData = await this.getUserPoints(sessionData.userId);
        
        if (!userPointsData || userPointsData.points < sessionData.pointsUsed) {
          throw new Error("User does not have enough points for this session");
        }
        
        // Deduct points
        await this.useUserPoints(sessionData.userId, sessionData.pointsUsed);
      }
      
      const [session] = await db
        .insert(coachingSessions)
        .values({
          ...sessionData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return session;
    } catch (error) {
      console.error("Error creating coaching session:", error);
      throw new Error("Failed to create coaching session");
    }
  }

  async updateCoachingSession(sessionId: number, sessionData: Partial<CoachingSessionInput>): Promise<CoachingSession> {
    try {
      const [updatedSession] = await db
        .update(coachingSessions)
        .set({
          ...sessionData,
          updatedAt: new Date()
        })
        .where(eq(coachingSessions.id, sessionId))
        .returning();
      
      if (!updatedSession) {
        throw new Error(`Coaching session with ID ${sessionId} not found`);
      }
      
      return updatedSession;
    } catch (error) {
      console.error("Error updating coaching session:", error);
      throw new Error("Failed to update coaching session");
    }
  }

  async getCoachingSessionById(id: number): Promise<CoachingSession | undefined> {
    try {
      const [session] = await db
        .select()
        .from(coachingSessions)
        .where(eq(coachingSessions.id, id));
      
      return session;
    } catch (error) {
      console.error("Error getting coaching session by ID:", error);
      return undefined;
    }
  }

  async getUserCoachingSessions(userId: number): Promise<CoachingSession[]> {
    try {
      return await db
        .select()
        .from(coachingSessions)
        .where(eq(coachingSessions.userId, userId));
    } catch (error) {
      console.error("Error getting user coaching sessions:", error);
      return [];
    }
  }

  async getCoachCoachingSessions(coachId: number): Promise<CoachingSession[]> {
    try {
      return await db
        .select()
        .from(coachingSessions)
        .where(eq(coachingSessions.coachId, coachId));
    } catch (error) {
      console.error("Error getting coach coaching sessions:", error);
      return [];
    }
  }

  // User points methods
  async getUserPoints(userId: number): Promise<UserPoints | undefined> {
    try {
      const [points] = await db
        .select()
        .from(userPoints)
        .where(eq(userPoints.userId, userId));
      
      return points;
    } catch (error) {
      console.error("Error getting user points:", error);
      return undefined;
    }
  }

  async addUserPoints(userId: number, points: number): Promise<UserPoints> {
    try {
      const existingPoints = await this.getUserPoints(userId);
      
      if (existingPoints) {
        // Update existing points
        const [updatedPoints] = await db
          .update(userPoints)
          .set({
            points: existingPoints.points + points,
            lastUpdated: new Date()
          })
          .where(eq(userPoints.userId, userId))
          .returning();
        
        return updatedPoints;
      } else {
        // Create new points record
        const [newPoints] = await db
          .insert(userPoints)
          .values({
            userId,
            points,
            lastUpdated: new Date()
          })
          .returning();
        
        return newPoints;
      }
    } catch (error) {
      console.error("Error adding user points:", error);
      throw new Error("Failed to add user points");
    }
  }

  async useUserPoints(userId: number, points: number): Promise<UserPoints> {
    try {
      const existingPoints = await this.getUserPoints(userId);
      
      if (!existingPoints) {
        throw new Error("User has no points record");
      }
      
      if (existingPoints.points < points) {
        throw new Error("User does not have enough points");
      }
      
      const [updatedPoints] = await db
        .update(userPoints)
        .set({
          points: existingPoints.points - points,
          lastUpdated: new Date()
        })
        .where(eq(userPoints.userId, userId))
        .returning();
      
      return updatedPoints;
    } catch (error) {
      console.error("Error using user points:", error);
      throw new Error("Failed to use user points");
    }
  }
}

export const storage = new DatabaseStorage();
