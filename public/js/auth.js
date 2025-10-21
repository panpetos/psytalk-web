// Authentication Module

const Auth = {
  currentUser: null,
  
  // Initialize auth state
  async init() {
    try {
      const user = await API.auth.me();
      this.currentUser = user;
      return user;
    } catch (error) {
      this.currentUser = null;
      return null;
    }
  },
  
  // Register new user
  async register(data) {
    try {
      const user = await API.auth.register(data);
      this.currentUser = user;
      return user;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  },
  
  // Login
  async login(email, password) {
    try {
      const user = await API.auth.login(email, password);
      this.currentUser = user;
      return user;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },
  
  // Logout
  async logout() {
    try {
      await API.auth.logout();
      this.currentUser = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
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
  }
};
