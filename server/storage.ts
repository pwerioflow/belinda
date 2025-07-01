import {
  users,
  children,
  activities,
  photos,
  songs,
  type User,
  type InsertUser,
  type Child,
  type InsertChild,
  type Activity,
  type InsertActivity,
  type Photo,
  type Song,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Child operations
  getChild(id: number): Promise<Child | undefined>;
  getChildByParentId(parentId: number): Promise<Child | undefined>;
  createChild(child: InsertChild & { parentId: number }): Promise<Child>;
  updateChild(id: number, updates: Partial<InsertChild>): Promise<Child>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByChildAndDate(childId: number, date: string): Promise<Activity[]>;
  
  // Content operations
  getAllPhotos(): Promise<Photo[]>;
  getAllSongs(): Promise<Song[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private children: Map<number, Child>;
  private activities: Map<number, Activity>;
  private photos: Map<number, Photo>;
  private songs: Map<number, Song>;
  private currentUserId: number;
  private currentChildId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.children = new Map();
    this.activities = new Map();
    this.photos = new Map();
    this.songs = new Map();
    this.currentUserId = 1;
    this.currentChildId = 1;
    this.currentActivityId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize default photos
    const defaultPhotos: Photo[] = [
      {
        id: 1,
        url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        title: "Cachorrinhos Felizes",
        alt: "Cachorrinhos brincando no campo",
        order: 1,
      },
      {
        id: 2,
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        title: "Balões no Céu",
        alt: "Balões coloridos no céu azul",
        order: 2,
      },
      {
        id: 3,
        url: "https://images.unsplash.com/photo-1516298773066-c48f8e9bd92b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        title: "Arco-íris Mágico",
        alt: "Arco-íris sobre paisagem verde",
        order: 3,
      },
      {
        id: 4,
        url: "https://images.unsplash.com/photo-1516750105099-4b8a83e217ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        title: "Gatinho Brincalhão",
        alt: "Gatinho brincando com brinquedos",
        order: 4,
      },
    ];

    // Initialize default songs
    const defaultSongs: Song[] = [
      {
        id: 1,
        title: "Estrela Brilhante",
        icon: "star",
        color: "soft-blue",
        audioUrl: "/audio/estrela-brilhante.mp3",
        order: 1,
      },
      {
        id: 2,
        title: "Sol Dourado",
        icon: "sun",
        color: "lilac",
        audioUrl: "/audio/sol-dourado.mp3",
        order: 2,
      },
      {
        id: 3,
        title: "Jardim Feliz",
        icon: "leaf",
        color: "mint-green",
        audioUrl: "/audio/jardim-feliz.mp3",
        order: 3,
      },
    ];

    defaultPhotos.forEach(photo => this.photos.set(photo.id, photo));
    defaultSongs.forEach(song => this.songs.set(song.id, song));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      isParent: insertUser.isParent || false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getChild(id: number): Promise<Child | undefined> {
    return this.children.get(id);
  }

  async getChildByParentId(parentId: number): Promise<Child | undefined> {
    return Array.from(this.children.values()).find(
      child => child.parentId === parentId
    );
  }

  async createChild(child: InsertChild & { parentId: number }): Promise<Child> {
    const id = this.currentChildId++;
    const newChild: Child = {
      ...child,
      id,
      createdAt: new Date(),
    };
    this.children.set(id, newChild);
    return newChild;
  }

  async updateChild(id: number, updates: Partial<InsertChild>): Promise<Child> {
    const existingChild = this.children.get(id);
    if (!existingChild) {
      throw new Error("Child not found");
    }
    const updatedChild = { ...existingChild, ...updates };
    this.children.set(id, updatedChild);
    return updatedChild;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const newActivity: Activity = {
      ...activity,
      id,
      date: new Date(),
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getActivitiesByChildAndDate(childId: number, date: string): Promise<Activity[]> {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    return Array.from(this.activities.values()).filter(
      activity => 
        activity.childId === childId &&
        activity.date &&
        activity.date >= startOfDay &&
        activity.date < endOfDay
    );
  }

  async getAllPhotos(): Promise<Photo[]> {
    return Array.from(this.photos.values()).sort((a, b) => a.order - b.order);
  }

  async getAllSongs(): Promise<Song[]> {
    return Array.from(this.songs.values()).sort((a, b) => a.order - b.order);
  }
}

export const storage = new MemStorage();
