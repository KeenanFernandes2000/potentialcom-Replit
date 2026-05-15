import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { Readable } from "node:stream";
import { getAgent, POTENTIAL_API_BASE } from "./agents";
import sgMail from "@sendgrid/mail";
import { storage } from "./storage";
import {
  registerUserSchema,
  loginUserSchema,
  updateProfileSchema,
  newsletterSubscriberSchema,
  resourceDownloadSchema,
  partnerApplicationSchema,
  veraConsultationSchema,
  aylaConsultationSchema,
  csrInfographicLeadSchema,
} from "@shared/schema";
import { proxyWordPressRequest } from "./wp-proxy";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FORM_NOTIFICATION_TO =
  process.env.FORM_NOTIFICATION_TO || "rawzaba@potential.com";
const FORM_NOTIFICATION_FROM =
  process.env.FORM_NOTIFICATION_FROM ||
  process.env.SENDGRID_FROM_EMAIL ||
  "no-reply@ai.potential.com";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

async function sendFormNotificationEmail(
  subject: string,
  lines: string[],
): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn(
      "SENDGRID_API_KEY is not set; skipping form notification email.",
    );
    return;
  }

  try {
    const text = lines.join("\n");
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const intro = lines.find((line) => line.trim().length > 0) || subject;
    const fieldRows = lines
      .filter((line) => line.includes(":"))
      .map((line) => {
        const separatorIndex = line.indexOf(":");
        const label = escapeHtml(line.slice(0, separatorIndex).trim());
        const value = escapeHtml(line.slice(separatorIndex + 1).trim() || "N/A");

        return `<tr>
          <td style="padding: 12px 14px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; width: 38%;">${label}</td>
          <td style="padding: 12px 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">${value}</td>
        </tr>`;
      })
      .join("");

    const html = `
      <div style="background: #f3f4f6; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 20px 24px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff;">
              <h1 style="margin: 0; font-size: 20px; line-height: 1.3;">${escapeHtml(subject)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 24px 8px 24px;">
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151;">${escapeHtml(intro)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 24px 20px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                ${fieldRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px 20px 24px; font-size: 12px; color: #6b7280;">
              Sent from Potential website forms.
            </td>
          </tr>
        </table>
      </div>
    `;

    const [response] = await sgMail.send({
      to: FORM_NOTIFICATION_TO,
      from: FORM_NOTIFICATION_FROM,
      subject,
      text,
      html,
    });
    console.log(
      `[email] sent subject="${subject}" to="${FORM_NOTIFICATION_TO}" from="${FORM_NOTIFICATION_FROM}" status=${response.statusCode}`,
    );
  } catch (error) {
    console.error("Failed to send form notification email:", error);
  }
}

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
  // Serve BIMI logo SVG at lowercase path
  app.get("/assets/brand/bimi-logo.svg", (req, res) => {
    const filePath = path.resolve(
      process.cwd(),
      "public/assets/Brand",
      "bimi-logo.svg"
    );
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    res.sendFile(filePath);
  });

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

  // CSR Infographic lead capture
  app.post("/api/csr-infographic/submit", async (req, res) => {
    try {
      const validatedData = csrInfographicLeadSchema.parse(req.body);

      const lead = await storage.submitCsrInfographicLead(validatedData);

      res.status(201).json({
        message: "Thank you! Your infographic is ready to download.",
        lead,
        downloadUrl: "/assets/downloads/AI-Powered-CSR-Infographic.png",
      });
    } catch (error) {
      console.error("CSR infographic lead submission error:", error);
      res.status(400).json({
        message: "Invalid submission data",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Serve CSR infographic download
  app.get("/assets/downloads/AI-Powered-CSR-Infographic.png", (req, res) => {
    const filePath = path.resolve(
      process.cwd(),
      "public/assets/downloads",
      "AI-Powered-CSR-Infographic.png"
    );
    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=AI-Powered-CSR-Infographic.png"
    );
    res.sendFile(filePath);
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

  // Vera consultation form submission
  app.post("/api/vera/consultation", async (req, res) => {
    try {
      const validatedData = veraConsultationSchema.parse(req.body);

      const consultation = await storage.submitVeraConsultation(validatedData);
      await sendFormNotificationEmail("New Submission: Vera Booking Form", [
        "New submission received from the Vera booking form on ai.potential.com.",
        "Source: Vera booking form",
        "",
        `First Name: ${validatedData.firstName}`,
        `Last Name: ${validatedData.lastName}`,
        `Email: ${validatedData.email}`,
        `Phone Number: ${validatedData.countryCode} ${validatedData.phoneNumber}`,
        `Company Name: ${validatedData.companyName}`,
        `Company Website: ${validatedData.companyWebsite || "N/A"}`,
      ]);

      res.status(201).json({
        message: "Consultation request submitted successfully",
        consultation,
      });
    } catch (error) {
      console.error("Vera consultation submission error:", error);
      res.status(400).json({
        message: "Invalid consultation data",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Ayla consultation form submission
  app.post("/api/ayla/consultation", async (req, res) => {
    try {
      const validatedData = aylaConsultationSchema.parse(req.body);

      const consultation = await storage.submitAylaConsultation(validatedData);
      await sendFormNotificationEmail("New Submission: Ayla Booking Form", [
        "New submission received from the Ayla booking form on ai.potential.com.",
        "Source: Ayla booking form",
        "",
        `First Name: ${validatedData.firstName}`,
        `Last Name: ${validatedData.lastName}`,
        `Email: ${validatedData.email}`,
        `Phone Number: ${validatedData.countryCode} ${validatedData.phoneNumber}`,
        `Company Name: ${validatedData.companyName}`,
        `Company Website: ${validatedData.companyWebsite || "N/A"}`,
        `Role: ${validatedData.role}`,
      ]);

      res.status(201).json({
        message: "Consultation request submitted successfully",
        consultation,
      });
    } catch (error) {
      console.error("Ayla consultation submission error:", error);
      res.status(400).json({
        message: "Invalid consultation data",
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
        req.session.destroy(() => { });
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

  // --- AI Agent proxy (native chat) ---

  // Streams an agent chat response. Browser sends only an agentKey; the bot ID
  // is resolved server-side and never exposed.
  app.post("/api/agent/:agentKey/chat", async (req, res) => {
    const agent = getAgent(req.params.agentKey);
    if (!agent) {
      return res.status(404).json({ message: "Unknown agent" });
    }
    try {
      const upstream = await fetch(
        `${POTENTIAL_API_BASE}/agent/chatbot/${agent.botId}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: req.body?.message,
            sessionId: req.body?.sessionId,
          }),
        },
      );
      if (!upstream.ok || !upstream.body) {
        return res
          .status(upstream.status || 502)
          .json({ message: "Upstream agent error" });
      }
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      Readable.fromWeb(upstream.body as any).pipe(res);
    } catch (err) {
      console.error("Agent chat proxy error:", err);
      res.status(502).json({ message: "Failed to reach agent" });
    }
  });

  // Returns whitelisted bot config — name, greeting, avatar only. The upstream
  // `system` prompt and internal IDs are deliberately stripped.
  app.get("/api/agent/:agentKey/bot", async (req, res) => {
    const agent = getAgent(req.params.agentKey);
    if (!agent) {
      return res.status(404).json({ message: "Unknown agent" });
    }
    try {
      const upstream = await fetch(
        `${POTENTIAL_API_BASE}/api/admin/bot/${agent.botId}`,
      );
      if (!upstream.ok) {
        return res
          .status(upstream.status || 502)
          .json({ message: "Upstream agent error" });
      }
      const data: any = await upstream.json();
      res.json({
        name: typeof data.name === "string" ? data.name : "",
        greeting: typeof data.greeting === "string" ? data.greeting : "",
        avatarUrl: data.imageName
          ? `${POTENTIAL_API_BASE}/static/mentors/${data.imageName}`
          : "",
        audiostt: data.audiostt === true,
        audiotts: data.audiotts === true,
      });
    } catch (err) {
      console.error("Agent bot config proxy error:", err);
      res.status(502).json({ message: "Failed to reach agent" });
    }
  });

  // Proxies an image upload to the upstream agent file endpoint. The raw
  // multipart body is streamed straight through — express.json() ignores
  // non-JSON content types, so the body arrives here untouched.
  app.post("/api/agent/:agentKey/upload", async (req, res) => {
    const agent = getAgent(req.params.agentKey);
    if (!agent) {
      return res.status(404).json({ message: "Unknown agent" });
    }
    try {
      const upstream = await fetch(`${POTENTIAL_API_BASE}/streaming/upload`, {
        method: "POST",
        headers: { "Content-Type": req.headers["content-type"] ?? "" },
        body: Readable.toWeb(req) as any,
        duplex: "half",
      } as any);
      const text = await upstream.text();
      res
        .status(upstream.status)
        .type(upstream.headers.get("content-type") ?? "application/json")
        .send(text);
    } catch (err) {
      console.error("Agent upload proxy error:", err);
      res.status(502).json({ message: "Failed to upload" });
    }
  });

  // Proxies a multipart audio upload to the upstream STT endpoint. The
  // raw multipart body is streamed straight through (express.json()
  // ignores non-JSON content types).
  app.post("/api/agent/:agentKey/transcribe", async (req, res) => {
    const agent = getAgent(req.params.agentKey);
    if (!agent) {
      return res.status(404).json({ message: "Unknown agent" });
    }
    try {
      const upstream = await fetch(
        `${POTENTIAL_API_BASE}/agent/chatbot/${agent.botId}/transcribe`,
        {
          method: "POST",
          headers: { "Content-Type": req.headers["content-type"] ?? "" },
          body: Readable.toWeb(req) as any,
          duplex: "half",
        } as any,
      );
      const text = await upstream.text();
      res
        .status(upstream.status)
        .type(upstream.headers.get("content-type") ?? "application/json")
        .send(text);
    } catch (err) {
      console.error("Agent transcribe proxy error:", err);
      res.status(502).json({ message: "Failed to reach agent" });
    }
  });

  // Proxies a text-to-speech request to the upstream TTS endpoint. The
  // upstream replies with audio/mpeg on success or JSON on error.
  app.post("/api/agent/:agentKey/speak", async (req, res) => {
    const agent = getAgent(req.params.agentKey);
    if (!agent) {
      return res.status(404).json({ message: "Unknown agent" });
    }
    try {
      const upstream = await fetch(
        `${POTENTIAL_API_BASE}/agent/chatbot/${agent.botId}/speak`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: req.body?.text }),
        },
      );
      const contentType = upstream.headers.get("content-type") ?? "";
      if (contentType.includes("audio/")) {
        const buffer = Buffer.from(await upstream.arrayBuffer());
        res.status(upstream.status).type(contentType).send(buffer);
        return;
      }
      const text = await upstream.text();
      res
        .status(upstream.status)
        .type(contentType || "application/json")
        .send(text);
    } catch (err) {
      console.error("Agent speak proxy error:", err);
      res.status(502).json({ message: "Failed to reach agent" });
    }
  });

  // Mints a voice-mode room via potentialTS. The upstream gates the
  // request on the bot's voice-trial budget and returns
  // {roomName, token, wsUrl, participantName}. The browser then opens
  // a WebSocket directly to potentialTS using those values; this proxy
  // does NOT sit in the audio data path.
  app.post("/api/agent/:agentKey/voice/room", async (req, res) => {
    const agent = getAgent(req.params.agentKey);
    if (!agent) {
      return res.status(404).json({ message: "Unknown agent" });
    }
    const sessionId = req.body?.sessionId;
    if (typeof sessionId !== "string" || sessionId.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "sessionId is required" });
    }
    try {
      const upstream = await fetch(
        `${POTENTIAL_API_BASE}/api/voice/room/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            botId: agent.botId,
            sessionId,
          }),
        },
      );
      const text = await upstream.text();
      res
        .status(upstream.status)
        .type(upstream.headers.get("content-type") ?? "application/json")
        .send(text);
    } catch (err) {
      console.error("Agent voice room proxy error:", err);
      res.status(502).json({ message: "Failed to reach voice service" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
