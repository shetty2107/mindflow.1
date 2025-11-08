import {
  type User,
  type InsertUser,
  type StudyPlan,
  type InsertStudyPlan,
  type Task,
  type InsertTask,
  type StudySession,
  type InsertStudySession,
  type Emotion,
  type InsertEmotion,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Study Plans
  getStudyPlan(id: string): Promise<StudyPlan | undefined>;
  getStudyPlansByUserId(userId: string): Promise<StudyPlan[]>;
  getLatestStudyPlan(userId: string): Promise<StudyPlan | undefined>;
  createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan>;

  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  getTasksByUserId(userId: string): Promise<Task[]>;
  getTasksByPlanId(planId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Study Sessions
  getStudySession(id: string): Promise<StudySession | undefined>;
  getStudySessionsByUserId(userId: string): Promise<StudySession[]>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: string, updates: Partial<StudySession>): Promise<StudySession | undefined>;

  // Emotions
  getEmotion(id: string): Promise<Emotion | undefined>;
  getEmotionsByUserId(userId: string): Promise<Emotion[]>;
  createEmotion(emotion: InsertEmotion): Promise<Emotion>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private studyPlans: Map<string, StudyPlan>;
  private tasks: Map<string, Task>;
  private studySessions: Map<string, StudySession>;
  private emotions: Map<string, Emotion>;

  constructor() {
    this.users = new Map();
    this.studyPlans = new Map();
    this.tasks = new Map();
    this.studySessions = new Map();
    this.emotions = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Study Plans
  async getStudyPlan(id: string): Promise<StudyPlan | undefined> {
    return this.studyPlans.get(id);
  }

  async getStudyPlansByUserId(userId: string): Promise<StudyPlan[]> {
    return Array.from(this.studyPlans.values())
      .filter((plan) => plan.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLatestStudyPlan(userId: string): Promise<StudyPlan | undefined> {
    const plans = await this.getStudyPlansByUserId(userId);
    return plans[0];
  }

  async createStudyPlan(insertPlan: InsertStudyPlan): Promise<StudyPlan> {
    const id = randomUUID();
    const plan: StudyPlan = {
      ...insertPlan,
      id,
      createdAt: new Date(),
    };
    this.studyPlans.set(id, plan);
    return plan;
  }

  // Tasks
  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((task) => task.userId === userId)
      .sort((a, b) => {
        // Sort by completion (incomplete first), then by priority
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder];
      });
  }

  async getTasksByPlanId(planId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((task) => task.planId === planId);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      completed: insertTask.completed ?? false,
      priority: insertTask.priority ?? "medium",
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Study Sessions
  async getStudySession(id: string): Promise<StudySession | undefined> {
    return this.studySessions.get(id);
  }

  async getStudySessionsByUserId(userId: string): Promise<StudySession[]> {
    return Array.from(this.studySessions.values())
      .filter((session) => session.userId === userId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  async createStudySession(insertSession: InsertStudySession): Promise<StudySession> {
    const id = randomUUID();
    const session: StudySession = {
      ...insertSession,
      id,
      startedAt: new Date(),
    };
    this.studySessions.set(id, session);
    return session;
  }

  async updateStudySession(id: string, updates: Partial<StudySession>): Promise<StudySession | undefined> {
    const session = this.studySessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates };
    this.studySessions.set(id, updatedSession);
    return updatedSession;
  }

  // Emotions
  async getEmotion(id: string): Promise<Emotion | undefined> {
    return this.emotions.get(id);
  }

  async getEmotionsByUserId(userId: string): Promise<Emotion[]> {
    return Array.from(this.emotions.values())
      .filter((emotion) => emotion.userId === userId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }

  async createEmotion(insertEmotion: InsertEmotion): Promise<Emotion> {
    const id = randomUUID();
    const emotion: Emotion = {
      ...insertEmotion,
      id,
      recordedAt: new Date(),
    };
    this.emotions.set(id, emotion);
    return emotion;
  }
}

export const storage = new MemStorage();
