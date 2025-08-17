import { AuthUser } from "@/types";

// Simple auth state management - in a real app you'd use a proper auth library
let currentUser: AuthUser | null = null;
let authListeners: ((user: AuthUser | null) => void)[] = [];

export const authService = {
  getCurrentUser(): AuthUser | null {
    return currentUser;
  },

  setCurrentUser(user: AuthUser | null) {
    currentUser = user;
    authListeners.forEach(listener => listener(user));
  },

  onAuthChange(listener: (user: AuthUser | null) => void) {
    authListeners.push(listener);
    return () => {
      authListeners = authListeners.filter(l => l !== listener);
    };
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const user = await response.json();
    this.setCurrentUser(user);
    return user;
  },

  async register(userData: {
    email: string;
    password: string;
    role: 'client' | 'psychologist';
    firstName: string;
    lastName: string;
  }): Promise<AuthUser> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const user = await response.json();
    this.setCurrentUser(user);
    return user;
  },

  logout() {
    this.setCurrentUser(null);
  },
};
