import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPsychologistSchema, insertAppointmentSchema, insertReviewSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // If user is a psychologist, create psychologist profile
      if (userData.role === 'psychologist') {
        await storage.createPsychologist({
          userId: user.id,
          specialization: "Не указана",
          experience: 0,
          education: "Не указано",
          description: "Заполните профиль",
          price: "0.00",
          formats: ["video"],
          certifications: []
        });
      }
      
      // Remove password from response
      const { password, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // In a real app, you'd create a JWT token here
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const { password, ...userResponse } = user;
    res.json(userResponse);
  });

  // Psychologist routes
  app.post("/api/psychologists", async (req, res) => {
    try {
      const psychologistData = insertPsychologistSchema.parse(req.body);
      const psychologist = await storage.createPsychologist(psychologistData);
      res.status(201).json(psychologist);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/psychologists/search", async (req, res) => {
    const { specialization, minPrice, maxPrice, formats } = req.query;
    
    const filters: any = { isApproved: true };
    
    if (specialization) filters.specialization = specialization as string;
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    if (formats) {
      filters.formats = Array.isArray(formats) ? formats : [formats];
    }
    
    const psychologists = await storage.searchPsychologists(filters);
    res.json(psychologists);
  });

  app.get("/api/psychologists/:id", async (req, res) => {
    const psychologist = await storage.getPsychologist(req.params.id);
    if (!psychologist) {
      return res.status(404).json({ error: "Psychologist not found" });
    }
    
    const user = await storage.getUser(psychologist.userId);
    res.json({ ...psychologist, user });
  });

  app.get("/api/psychologists/user/:userId", async (req, res) => {
    const psychologist = await storage.getPsychologistByUserId(req.params.userId);
    if (!psychologist) {
      return res.status(404).json({ error: "Psychologist profile not found" });
    }
    
    const user = await storage.getUser(psychologist.userId);
    res.json({ ...psychologist, user });
  });

  app.put("/api/psychologists/:id", async (req, res) => {
    const updates = req.body;
    const psychologist = await storage.updatePsychologist(req.params.id, updates);
    
    if (!psychologist) {
      return res.status(404).json({ error: "Psychologist not found" });
    }
    
    res.json(psychologist);
  });

  // User profile routes
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.put("/api/users/:id", async (req, res) => {
    const updates = req.body;
    const user = await storage.updateUser(req.params.id, updates);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  // Appointment routes
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/appointments/client/:clientId", async (req, res) => {
    const appointments = await storage.getAppointmentsByClient(req.params.clientId);
    res.json(appointments);
  });

  app.get("/api/appointments/psychologist/:psychologistId", async (req, res) => {
    const appointments = await storage.getAppointmentsByPsychologist(req.params.psychologistId);
    res.json(appointments);
  });

  app.put("/api/appointments/:id", async (req, res) => {
    const updates = req.body;
    const appointment = await storage.updateAppointment(req.params.id, updates);
    
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    
    res.json(appointment);
  });

  // Review routes
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/reviews/psychologist/:psychologistId", async (req, res) => {
    const reviews = await storage.getReviewsByPsychologist(req.params.psychologistId);
    res.json(reviews);
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    const users = await storage.getAllUsers();
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  });

  app.get("/api/admin/psychologists/pending", async (req, res) => {
    const pending = await storage.getPendingPsychologists();
    res.json(pending);
  });

  app.put("/api/admin/psychologists/:id/approve", async (req, res) => {
    await storage.approvePsychologist(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/psychologists/:id/reject", async (req, res) => {
    try {
      await storage.rejectPsychologist(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to reject psychologist" });
    }
  });

  // Stats routes for admin dashboard
  app.get("/api/admin/stats", async (req, res) => {
    const users = await storage.getAllUsers();
    const psychologists = await storage.searchPsychologists({ isApproved: true });
    
    res.json({
      totalUsers: users.length,
      activePsychologists: psychologists.length,
      monthlySessions: 3421, // Mock data for demo
      platformRevenue: "342150.00", // Mock data for demo
    });
  });

  // User management routes
  app.put("/api/admin/users/:id/freeze", async (req, res) => {
    try {
      await storage.updateUser(req.params.id, { isFrozen: true });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to freeze user" });
    }
  });

  app.put("/api/admin/users/:id/unfreeze", async (req, res) => {
    try {
      await storage.updateUser(req.params.id, { isFrozen: false });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to unfreeze user" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
