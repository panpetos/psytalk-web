import { 
  type User, 
  type InsertUser, 
  type Psychologist,
  type InsertPsychologist,
  type Appointment,
  type InsertAppointment,
  type Review,
  type InsertReview,
  type Message,
  type InsertMessage,
  type Availability,
  type InsertAvailability,
  type PsychologistWithUser,
  type AppointmentWithDetails,
  type ReviewWithDetails
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Psychologists
  getPsychologist(id: string): Promise<Psychologist | undefined>;
  getPsychologistByUserId(userId: string): Promise<Psychologist | undefined>;
  createPsychologist(psychologist: InsertPsychologist): Promise<Psychologist>;
  updatePsychologist(id: string, updates: Partial<Psychologist>): Promise<Psychologist | undefined>;
  searchPsychologists(filters: {
    specialization?: string;
    minPrice?: number;
    maxPrice?: number;
    formats?: string[];
    isApproved?: boolean;
  }): Promise<PsychologistWithUser[]>;
  
  // Appointments
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  getAppointmentsByClient(clientId: string): Promise<AppointmentWithDetails[]>;
  getAppointmentsByPsychologist(psychologistId: string): Promise<AppointmentWithDetails[]>;
  
  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByPsychologist(psychologistId: string): Promise<ReviewWithDetails[]>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetween(user1Id: string, user2Id: string): Promise<Message[]>;
  
  // Availability
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  getAvailabilityByPsychologist(psychologistId: string): Promise<Availability[]>;
  
  // Admin functions
  getAllUsers(): Promise<User[]>;
  getPendingPsychologists(): Promise<PsychologistWithUser[]>;
  approvePsychologist(psychologistId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private psychologists: Map<string, Psychologist> = new Map();
  private appointments: Map<string, Appointment> = new Map();
  private reviews: Map<string, Review> = new Map();
  private messages: Map<string, Message> = new Map();
  private availability: Map<string, Availability> = new Map();

  constructor() {
    this.seedData();
  }

  private async seedData() {
    // Create admin user
    const adminUser = await this.createUser({
      email: "admin@psychplatform.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      firstName: "Администратор",
      lastName: "Системы",
    });

    // Create sample psychologists
    const psychologist1User = await this.createUser({
      email: "anna.petrova@psychplatform.com",
      password: await bcrypt.hash("psychologist123", 10),
      role: "psychologist",
      firstName: "Анна",
      lastName: "Петрова",
    });

    const psychologist1 = await this.createPsychologist({
      userId: psychologist1User.id,
      specialization: "Семейная терапия",
      experience: 8,
      education: "МГУ, факультет психологии",
      certifications: ["Семейная терапия", "Когнитивно-поведенческая терапия"],
      description: "Специализируюсь на семейных отношениях, конфликтах в паре и детско-родительских отношениях",
      price: "2500.00",
      formats: ["video", "audio", "chat"],
    });
    
    // Approve demo psychologists
    await this.approvePsychologist(psychologist1.id);

    const psychologist2User = await this.createUser({
      email: "mikhail.sidorov@psychplatform.com",
      password: await bcrypt.hash("psychologist123", 10),
      role: "psychologist",
      firstName: "Михаил",
      lastName: "Сидоров",
    });

    const psychologist2 = await this.createPsychologist({
      userId: psychologist2User.id,
      specialization: "Когнитивно-поведенческая терапия",
      experience: 12,
      education: "СПбГУ, клиническая психология",
      certifications: ["КПТ", "Работа с тревожными расстройствами"],
      description: "Работаю с тревожными расстройствами, депрессией и паническими атаками",
      price: "3000.00",
      formats: ["video", "audio"],
    });
    
    await this.approvePsychologist(psychologist2.id);

    // Create sample client
    const clientUser = await this.createUser({
      email: "maria.ivanova@example.com",
      password: await bcrypt.hash("client123", 10),
      role: "client",
      firstName: "Мария",
      lastName: "Иванова",
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      avatar: insertUser.avatar || null,
      isVerified: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Psychologist methods
  async getPsychologist(id: string): Promise<Psychologist | undefined> {
    return this.psychologists.get(id);
  }

  async getPsychologistByUserId(userId: string): Promise<Psychologist | undefined> {
    return Array.from(this.psychologists.values()).find(p => p.userId === userId);
  }

  async createPsychologist(insertPsychologist: InsertPsychologist): Promise<Psychologist> {
    const id = randomUUID();
    const psychologist: Psychologist = {
      ...insertPsychologist,
      id,
      isApproved: false,
      rating: "0",
      totalReviews: 0,
      certifications: Array.isArray(insertPsychologist.certifications) ? insertPsychologist.certifications as string[] : null,
      formats: Array.isArray(insertPsychologist.formats) ? insertPsychologist.formats as string[] : null,
    };
    this.psychologists.set(id, psychologist);
    return psychologist;
  }

  async updatePsychologist(id: string, updates: Partial<Psychologist>): Promise<Psychologist | undefined> {
    const psychologist = this.psychologists.get(id);
    if (!psychologist) return undefined;
    
    const updated = { ...psychologist, ...updates };
    this.psychologists.set(id, updated);
    return updated;
  }

  async searchPsychologists(filters: {
    specialization?: string;
    minPrice?: number;
    maxPrice?: number;
    formats?: string[];
    isApproved?: boolean;
  }): Promise<PsychologistWithUser[]> {
    let results = Array.from(this.psychologists.values());
    
    if (filters.isApproved !== undefined) {
      results = results.filter(p => p.isApproved === filters.isApproved);
    }
    
    if (filters.specialization) {
      results = results.filter(p => 
        p.specialization.toLowerCase().includes(filters.specialization!.toLowerCase())
      );
    }
    
    if (filters.minPrice !== undefined) {
      results = results.filter(p => parseFloat(p.price) >= filters.minPrice!);
    }
    
    if (filters.maxPrice !== undefined) {
      results = results.filter(p => parseFloat(p.price) <= filters.maxPrice!);
    }
    
    if (filters.formats && filters.formats.length > 0) {
      results = results.filter(p => 
        p.formats && Array.isArray(p.formats) && filters.formats!.some(format => p.formats!.includes(format))
      );
    }
    
    // Add user data
    return results.map(p => {
      const user = this.users.get(p.userId)!;
      return { ...p, user };
    });
  }

  // Appointment methods
  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      notes: insertAppointment.notes || null,
      status: "scheduled",
      duration: insertAppointment.duration || 50,
      createdAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updated = { ...appointment, ...updates };
    this.appointments.set(id, updated);
    return updated;
  }

  async getAppointmentsByClient(clientId: string): Promise<AppointmentWithDetails[]> {
    const appointments = Array.from(this.appointments.values())
      .filter(a => a.clientId === clientId);
    
    return appointments.map(a => {
      const client = this.users.get(a.clientId)!;
      const psychologist = this.psychologists.get(a.psychologistId)!;
      const psychologistUser = this.users.get(psychologist.userId)!;
      
      return {
        ...a,
        client,
        psychologist: { ...psychologist, user: psychologistUser }
      };
    });
  }

  async getAppointmentsByPsychologist(psychologistId: string): Promise<AppointmentWithDetails[]> {
    const appointments = Array.from(this.appointments.values())
      .filter(a => a.psychologistId === psychologistId);
    
    return appointments.map(a => {
      const client = this.users.get(a.clientId)!;
      const psychologist = this.psychologists.get(a.psychologistId)!;
      const psychologistUser = this.users.get(psychologist.userId)!;
      
      return {
        ...a,
        client,
        psychologist: { ...psychologist, user: psychologistUser }
      };
    });
  }

  // Review methods
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      comment: insertReview.comment || null,
      isModerated: false,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    
    // Update psychologist rating
    const psychologist = this.psychologists.get(insertReview.psychologistId);
    if (psychologist) {
      const reviews = Array.from(this.reviews.values())
        .filter(r => r.psychologistId === insertReview.psychologistId);
      
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      await this.updatePsychologist(insertReview.psychologistId, {
        rating: avgRating.toFixed(1),
        totalReviews: reviews.length,
      });
    }
    
    return review;
  }

  async getReviewsByPsychologist(psychologistId: string): Promise<ReviewWithDetails[]> {
    const reviews = Array.from(this.reviews.values())
      .filter(r => r.psychologistId === psychologistId);
    
    return reviews.map(r => {
      const client = this.users.get(r.clientId)!;
      const psychologist = this.psychologists.get(r.psychologistId)!;
      const psychologistUser = this.users.get(psychologist.userId)!;
      
      return {
        ...r,
        client,
        psychologist: { ...psychologist, user: psychologistUser }
      };
    });
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      isRead: false,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesBetween(user1Id: string, user2Id: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => 
        (m.senderId === user1Id && m.receiverId === user2Id) ||
        (m.senderId === user2Id && m.receiverId === user1Id)
      )
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  // Availability methods
  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const id = randomUUID();
    const availability: Availability = {
      ...insertAvailability,
      id,
      isActive: true,
    };
    this.availability.set(id, availability);
    return availability;
  }

  async getAvailabilityByPsychologist(psychologistId: string): Promise<Availability[]> {
    return Array.from(this.availability.values())
      .filter(a => a.psychologistId === psychologistId && a.isActive);
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getPendingPsychologists(): Promise<PsychologistWithUser[]> {
    const pending = Array.from(this.psychologists.values())
      .filter(p => !p.isApproved);
    
    return pending.map(p => {
      const user = this.users.get(p.userId)!;
      return { ...p, user };
    });
  }

  async approvePsychologist(psychologistId: string): Promise<void> {
    await this.updatePsychologist(psychologistId, { isApproved: true });
  }
}

export const storage = new MemStorage();
