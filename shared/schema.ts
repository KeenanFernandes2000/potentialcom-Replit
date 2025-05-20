import { pgTable, text, serial, timestamp, varchar, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User authentication and profile table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  jobTitle: varchar("job_title", { length: 100 }),
  companyName: varchar("company_name", { length: 255 }),
  companyWebsite: varchar("company_website", { length: 255 }),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  role: varchar("role", { length: 50 }).default("public_user").notNull(),
  companySize: varchar("company_size", { length: 50 }),
  partnerReason: text("partner_reason"),
  isSubscribedToNewsletter: boolean("is_subscribed_newsletter").default(false),
  isVerified: boolean("is_verified").default(false),
  verificationToken: text("verification_token"),
  resetPasswordToken: text("reset_password_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Newsletter subscribers table (for users who only subscribed to newsletter without registering)
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Resource downloads tracking
export const resourceDownloads = pgTable("resource_downloads", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  resourceName: varchar("resource_name", { length: 255 }).notNull(),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
});

// Coaches table
export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  bio: text("bio").notNull(),
  expertise: varchar("expertise", { length: 255 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  pointsCost: integer("points_cost"),
  isAvailableForFree: boolean("is_available_for_free").default(false),
  isAvailableForPaid: boolean("is_available_for_paid").default(true),
  isAvailableForPoints: boolean("is_available_for_points").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coaching sessions table
export const coachingSessions = pgTable("coaching_sessions", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionDate: timestamp("session_date").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"), // scheduled, completed, cancelled
  sessionType: varchar("session_type", { length: 50 }).notNull(), // free, paid, points
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }),
  pointsUsed: integer("points_used"),
  notes: text("notes"),
  meetingLink: varchar("meeting_link", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User points table
export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  points: integer("points").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Authentication schemas
export const registerUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  isSubscribedToNewsletter: true,
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateProfileSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  phoneNumber: true,
  jobTitle: true,
  companyName: true,
  companyWebsite: true,
  linkedinUrl: true,
}).partial();

// Partner application schema
export const partnerApplicationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  companyWebsite: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]),
  partnerReason: z.string().min(10, "Please tell us more about why you want to partner with us"),
  isSubscribedToNewsletter: z.boolean().default(false),
});

export const newsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).pick({
  email: true,
});

export const resourceDownloadSchema = createInsertSchema(resourceDownloads).pick({
  email: true,
  resourceName: true,
});

// Types
// Coach schemas
export const coachSchema = createInsertSchema(coaches).omit({
  id: true,
  userId: true,
  createdAt: true, 
  updatedAt: true
});

export const coachingSessionSchema = createInsertSchema(coachingSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const userPointsSchema = createInsertSchema(userPoints).pick({
  userId: true,
  points: true
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type PartnerApplicationInput = z.infer<typeof partnerApplicationSchema>;
export type NewsletterSubscriberInput = z.infer<typeof newsletterSubscriberSchema>;
export type ResourceDownloadInput = z.infer<typeof resourceDownloadSchema>;
export type CoachInput = z.infer<typeof coachSchema>;
export type CoachingSessionInput = z.infer<typeof coachingSessionSchema>;
export type UserPointsInput = z.infer<typeof userPointsSchema>;

export type User = typeof users.$inferSelect;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type ResourceDownload = typeof resourceDownloads.$inferSelect;
export type Coach = typeof coaches.$inferSelect;
export type CoachingSession = typeof coachingSessions.$inferSelect;
export type UserPoints = typeof userPoints.$inferSelect;
