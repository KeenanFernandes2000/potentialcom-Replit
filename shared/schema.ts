import { pgTable, text, serial, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
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
  companyWebsite: varchar("company_website", { length: 255 }),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
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
  companyWebsite: true,
  linkedinUrl: true,
}).partial();

export const newsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).pick({
  email: true,
});

export const resourceDownloadSchema = createInsertSchema(resourceDownloads).pick({
  email: true,
  resourceName: true,
});

// Types
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type NewsletterSubscriberInput = z.infer<typeof newsletterSubscriberSchema>;
export type ResourceDownloadInput = z.infer<typeof resourceDownloadSchema>;

export type User = typeof users.$inferSelect;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type ResourceDownload = typeof resourceDownloads.$inferSelect;
