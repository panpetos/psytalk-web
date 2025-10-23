// Authentication Module

const Auth = {
  currentUser: null,
  lastError: null,

  extractUser(payload, fallbackMessage = 'Authentication failed') {
    if (!payload) {
      return null;
    }

    if (payload.success === false || payload.status === 'error') {
      throw new Error(payload.message || payload.error || fallbackMessage);
    }

    if (typeof payload.error === 'string' && !payload.id) {
      throw new Error(payload.error);
    }

    if (payload.data && payload.data.user) {
      return this.normalizeUser(payload.data.user);
    }

    if (payload.user) {
      return this.normalizeUser(payload.user);
    }

    return this.normalizeUser(payload);
  },

  normalizeUser(user) {
    if (!user || typeof user !== 'object') {
      return user;
    }

    const normalized = { ...user };

    if (normalized.role === 'user') {
      normalized.role = 'client';
    }

    return normalized;
  },

  // Initialize auth state
  async init() {
    try {
      const data = await API.auth.me();
      const user = this.extractUser(data, 'Not authenticated');
      if (!user) {
        const error = new Error('Not authenticated');
        error.status = 401;
        this.currentUser = null;
        this.lastError = error;
        return null;
      }

      this.currentUser = user;
      this.lastError = null;
      return user;
    } catch (error) {
      this.currentUser = null;
      this.lastError = error;
      return null;
    }
  },

  // Register new user
  async register(data) {
    try {
      const response = await API.auth.register(data);
      const user = this.extractUser(response, 'Registration failed');
      this.currentUser = user;
      this.lastError = null;
      return user;
    } catch (error) {
      this.lastError = error;
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Login
  async login(email, password) {
    try {
      const response = await API.auth.login(email, password);
      const user = this.extractUser(response, 'Login failed');
      this.currentUser = user;
      this.lastError = null;
      return user;
    } catch (error) {
      this.currentUser = null;
      this.lastError = error;
      throw new Error(error.message || 'Login failed');
    }
  },

  // Logout
  async logout() {
    try {
      await API.auth.logout();
      this.lastError = null;
    } catch (error) {
      console.error('Logout error:', error);
      this.lastError = error;
    } finally {
      this.currentUser = null;
    }
  },

  setUser(user) {
    this.currentUser = user;
    this.lastError = null;
    return user;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  },
  
  // Check if user has specific role
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  },
  
  // Redirect based on role
  redirectToDashboard() {
    if (!this.currentUser) {
      window.location.href = '/login.html';
      return;
    }
    
    switch (this.currentUser.role) {
      case 'client':
        window.location.href = '/client-dashboard.html';
        break;
      case 'psychologist':
        window.location.href = '/psychologist-dashboard.html';
        break;
      case 'admin':
        window.location.href = '/admin-dashboard.html';
        break;
      default:
        window.location.href = '/';
    }
  },
  
  // Require authentication (redirect if not logged in)
  async requireAuth(requiredRole = null) {
    if (!this.currentUser) {
      const user = await this.init();
      if (!user) {
        window.location.href = '/login.html';
        return false;
      }
    }
    
    if (requiredRole && !this.hasRole(requiredRole)) {
      this.redirectToDashboard();
      return false;
    }
    
    return true;
  },

  // Get current user
  getUser() {
    return this.currentUser;
  },

  async checkAuth() {
    if (this.currentUser) {
      return this.currentUser;
    }
    return this.init();
  }
};
