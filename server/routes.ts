import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { generateStudyPlan, adaptPlanToEmotion } from "./ai";
import {
  insertUserSchema,
  insertStudyPlanSchema,
  insertTaskSchema,
  insertStudySessionSchema,
  insertEmotionSchema,
} from "@shared/schema";
import { z } from "zod";

// Extend Express Session to include userId
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const MemoryStoreSession = MemoryStore(session);
const SALT_ROUNDS = 10;

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "mindflow-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // 24 hours
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // ==================== AUTH ROUTES ====================

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);

      // Check if username exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

      // Create user
      const user = await storage.createUser({
        username: data.username,
        password: hashedPassword,
      });

      // Set session
      req.session.userId = user.id;

      res.json({
        id: user.id,
        username: user.username,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare hashed password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;

      res.json({
        id: user.id,
        username: user.username,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // ==================== STUDY PLANS ROUTES ====================

  // Create study plan with AI generation
  app.post("/api/study-plans", requireAuth, async (req, res) => {
    try {
      const data = insertStudyPlanSchema.parse(req.body);
      const userId = req.session.userId!;

      // Generate AI study plan
      const aiGeneratedPlan = await generateStudyPlan({
        rawTasks: data.rawTasks,
        availableHours: data.availableHours,
        subject: data.subject,
        challenges: data.challenges,
      });

      // Create study plan
      const plan = await storage.createStudyPlan({
        ...data,
        userId,
        aiGeneratedPlan,
      });

      res.json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Create study plan error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create study plan" });
    }
  });

  // Get all study plans for user
  app.get("/api/study-plans", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const plans = await storage.getStudyPlansByUserId(userId);
      res.json(plans);
    } catch (error) {
      console.error("Get study plans error:", error);
      res.status(500).json({ message: "Failed to get study plans" });
    }
  });

  // Get latest study plan
  app.get("/api/study-plans/latest", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const plan = await storage.getLatestStudyPlan(userId);
      
      if (!plan) {
        return res.status(404).json({ message: "No study plans found" });
      }

      res.json(plan);
    } catch (error) {
      console.error("Get latest study plan error:", error);
      res.status(500).json({ message: "Failed to get study plan" });
    }
  });

  // Get specific study plan
  app.get("/api/study-plans/:id", requireAuth, async (req, res) => {
    try {
      const plan = await storage.getStudyPlan(req.params.id);
      
      if (!plan) {
        return res.status(404).json({ message: "Study plan not found" });
      }

      if (plan.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(plan);
    } catch (error) {
      console.error("Get study plan error:", error);
      res.status(500).json({ message: "Failed to get study plan" });
    }
  });

  // ==================== TASKS ROUTES ====================

  // Get all tasks for user
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const tasks = await storage.getTasksByUserId(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Get tasks error:", error);
      res.status(500).json({ message: "Failed to get tasks" });
    }
  });

  // Create task
  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const data = insertTaskSchema.parse(req.body);
      const userId = req.session.userId!;

      const task = await storage.createTask({
        ...data,
        userId,
      });

      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Create task error:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update task
  app.patch("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (task.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedTask = await storage.updateTask(req.params.id, req.body);
      res.json(updatedTask);
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Delete task
  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (task.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteTask(req.params.id);
      res.json({ message: "Task deleted" });
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // ==================== STUDY SESSIONS ROUTES ====================

  // Get all study sessions for user
  app.get("/api/study-sessions", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const sessions = await storage.getStudySessionsByUserId(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Get study sessions error:", error);
      res.status(500).json({ message: "Failed to get study sessions" });
    }
  });

  // Create study session
  app.post("/api/study-sessions", requireAuth, async (req, res) => {
    try {
      const data = insertStudySessionSchema.parse(req.body);
      const userId = req.session.userId!;

      const session = await storage.createStudySession({
        ...data,
        userId,
      });

      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Create study session error:", error);
      res.status(500).json({ message: "Failed to create study session" });
    }
  });

  // Update study session (e.g., mark as completed)
  app.patch("/api/study-sessions/:id", requireAuth, async (req, res) => {
    try {
      const session = await storage.getStudySession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: "Study session not found" });
      }

      if (session.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedSession = await storage.updateStudySession(req.params.id, req.body);
      res.json(updatedSession);
    } catch (error) {
      console.error("Update study session error:", error);
      res.status(500).json({ message: "Failed to update study session" });
    }
  });

  // ==================== EMOTIONS ROUTES ====================

  // Get all emotions for user
  app.get("/api/emotions", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const emotions = await storage.getEmotionsByUserId(userId);
      res.json(emotions);
    } catch (error) {
      console.error("Get emotions error:", error);
      res.status(500).json({ message: "Failed to get emotions" });
    }
  });

  // Record emotion
  app.post("/api/emotions", requireAuth, async (req, res) => {
    try {
      const data = insertEmotionSchema.parse(req.body);
      const userId = req.session.userId!;

      const emotion = await storage.createEmotion({
        ...data,
        userId,
      });

      res.json(emotion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Create emotion error:", error);
      res.status(500).json({ message: "Failed to record emotion" });
    }
  });

  // Adapt study plan based on emotion
  app.post("/api/study-plans/:id/adapt", requireAuth, async (req, res) => {
    try {
      const plan = await storage.getStudyPlan(req.params.id);
      
      if (!plan) {
        return res.status(404).json({ message: "Study plan not found" });
      }

      if (plan.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { emotion, intensity } = req.body;

      if (!emotion || !intensity) {
        return res.status(400).json({ message: "Emotion and intensity required" });
      }

      const adaptedPlan = await adaptPlanToEmotion(
        plan.aiGeneratedPlan,
        emotion,
        intensity
      );

      res.json({ adaptedPlan });
    } catch (error) {
      console.error("Adapt plan error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to adapt plan" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
