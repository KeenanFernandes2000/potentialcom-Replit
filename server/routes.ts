import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import {
  registerUserSchema,
  loginUserSchema,
  updateProfileSchema,
  newsletterSubscriberSchema,
  resourceDownloadSchema,
  partnerApplicationSchema,
} from "@shared/schema";
import { proxyWordPressRequest } from "./wp-proxy";

// Add userId to Express.Session interface
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve whitepaper PDF
  app.get("/api/whitepaper-download", (req, res) => {
    const filePath = path.resolve(
      process.cwd(),
      "public/assets/pdfs",
      "amplified-intelligence-whitepaper.pdf"
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Amplified-Intelligence-Whitepaper.pdf"
    );
    res.sendFile(filePath);
  });

  // WordPress proxy routes
  app.get("/api/wp/posts", async (req, res) => {
    try {
      const queryParams: Record<string, string> = {};

      // Extract all query parameters
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === "string") {
          queryParams[key] = value;
        }
      }

      // Always include _embed to get featured images
      queryParams._embed = "true";

      console.log("Posts request params:", queryParams);
      const result = await proxyWordPressRequest("/posts", queryParams);

      // Forward the WordPress headers
      if (result.headers.totalPages) {
        res.setHeader("X-WP-TotalPages", result.headers.totalPages);
      }

      res.json(result.data);
    } catch (error) {
      console.error("Error proxying WordPress posts:", error);
      res.status(500).json({
        message: "Failed to fetch blog posts",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.get("/api/wp/posts/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const decodedSlug = decodeURIComponent(slug);
      const queryParams: Record<string, string> = {};

      // Extract all query parameters
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === "string") {
          queryParams[key] = value;
        }
      }

      // Check if the slug contains Arabic characters
      const containsArabic = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
        decodedSlug
      );

      // For Arabic slugs, ALWAYS set language to Arabic
      if (containsArabic) {
        queryParams.lang = "ar";
        console.log(
          `[SERVER] Detected Arabic slug: ${decodedSlug}, forcing lang=ar`
        );
      }

      // Set slug and always include _embed
      queryParams.slug = decodedSlug;
      queryParams._embed = "true";

      // Log language parameter clearly
      const language = queryParams.lang || "en";
      console.log("language", queryParams.lang);
      console.log(
        `[SERVER] Request for post slug="${decodedSlug}", lang="${language}"`
      );
      console.log(`[SERVER] Full query params:`, queryParams);

      const result = await proxyWordPressRequest("/posts", queryParams);

      if (Array.isArray(result.data) && result.data.length > 0) {
        console.log(
          `[SERVER] Found post: ${result.data[0].title.rendered}, language=${language}`
        );
        res.json(result.data[0]);
      } else {
        console.log(
          `[SERVER] Post not found with slug=${decodedSlug}, language=${language}`
        );
        res
          .status(404)
          .json({ message: `Post with slug "${decodedSlug}" not found` });
      }
    } catch (error) {
      console.error(`[SERVER] Error proxying WordPress post:`, error);
      res.status(500).json({
        message: "Failed to fetch blog post",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.get("/api/wp/categories", async (req, res) => {
    try {
      const queryParams: Record<string, string> = {
        per_page: "100",
      };

      // Extract all query parameters, including lang
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === "string") {
          queryParams[key] = value;
        }
      }

      console.log("Categories request params:", queryParams);
      const result = await proxyWordPressRequest("/categories", queryParams);

      res.json(result.data);
    } catch (error) {
      console.error("Error proxying WordPress categories:", error);
      res.status(500).json({
        message: "Failed to fetch blog categories",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Public API routes

  // Registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.registerUser(validatedData);

      // TODO: Send verification email

      res.status(201).json({
        message: "Registration successful. Please verify your email.",
        userId: user.id,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        message: "Invalid registration data",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);

      const user = await storage.validateUserCredentials(
        validatedData.email,
        validatedData.password
      );

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      req.session.userId = user.id;

      // Return user data (excluding password)
      const { password, verificationToken, resetPasswordToken, ...userData } =
        user;
      res.json({ message: "Login successful", user: userData });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({
        message: "Invalid login data",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Verify email
  app.get("/api/auth/verify", async (req, res) => {
    const { email, token } = req.query;

    if (
      !email ||
      !token ||
      typeof email !== "string" ||
      typeof token !== "string"
    ) {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    const verified = await storage.verifyUser(email, token);

    if (!verified) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification link" });
    }

    res.json({ message: "Email verified successfully. You can now log in." });
  });

  // Request password reset
  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    const token = await storage.generateResetToken(email);

    if (!token) {
      return res.status(404).json({ message: "User not found" });
    }

    // TODO: Send password reset email

    res.json({ message: "Password reset instructions sent to your email" });
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const reset = await storage.resetPassword(email, token, newPassword);

    if (!reset) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    res.json({
      message:
        "Password reset successful. You can now log in with your new password",
    });
  });

  // Newsletter subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const validatedData = newsletterSubscriberSchema.parse(req.body);

      const subscriber = await storage.addNewsletterSubscriber(validatedData);

      res.status(201).json({
        message: "Subscribed to newsletter successfully",
        subscriber,
      });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      res.status(400).json({
        message: "Invalid subscription data",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Resource download tracking
  app.post("/api/resources/track-download", async (req, res) => {
    try {
      const validatedData = resourceDownloadSchema.parse(req.body);

      const download = await storage.trackResourceDownload(validatedData);

      res.status(201).json({
        message: "Download tracked successfully",
        download,
      });
    } catch (error) {
      console.error("Resource download tracking error:", error);
      res.status(400).json({
        message: "Invalid download data",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Partner application
  app.post("/api/partners/apply", async (req, res) => {
    try {
      const validatedData = partnerApplicationSchema.parse(req.body);

      const user = await storage.submitPartnerApplication(validatedData);

      // For security, don't return sensitive user data
      const {
        password,
        verificationToken,
        resetPasswordToken,
        ...partnerData
      } = user;

      res.status(201).json({
        message: "Partner application submitted successfully",
        partner: partnerData,
      });
    } catch (error) {
      console.error("Partner application error:", error);
      res.status(400).json({
        message: "Invalid partner application data",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Protected API routes (require authentication)

  // Get current user
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);

      if (!user) {
        req.session.destroy(() => {});
        return res.status(404).json({ message: "User not found" });
      }

      // Return user data (excluding password)
      const { password, verificationToken, resetPasswordToken, ...userData } =
        user;
      res.json(userData);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update profile
  app.put("/api/auth/profile", isAuthenticated, async (req, res) => {
    try {
      const validatedData = updateProfileSchema.parse(req.body);

      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const updatedUser = await storage.updateUserProfile(
        req.session.userId,
        validatedData
      );

      // Return updated user data (excluding password)
      const { password, verificationToken, resetPasswordToken, ...userData } =
        updatedUser;
      res.json(userData);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(400).json({
        message: "Invalid profile data",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Unsubscribe from newsletter
  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    await storage.removeNewsletterSubscriber(email);

    res.json({ message: "Unsubscribed from newsletter successfully" });
  });

  // Get resource downloads (for authenticated users)
  app.get("/api/resources/my-downloads", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const downloads = await storage.getResourceDownloadsByEmail(user.email);

      res.json(downloads);
    } catch (error) {
      console.error("Get downloads error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
