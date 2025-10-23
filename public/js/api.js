// API Client Module

const API = {
  baseURL: '',
  
  // Generic fetch wrapper
  async request(method, url, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }
      
      return responseData;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  // Convenience methods
  get(url) {
    return this.request('GET', url);
  },
  
  post(url, data) {
    return this.request('POST', url, data);
  },
  
  put(url, data) {
    return this.request('PUT', url, data);
  },
  
  delete(url) {
    return this.request('DELETE', url);
  },
  
  // Auth endpoints
  auth: {
    register(data) {
      return API.post('/api/auth/register', data);
    },
    
    login(email, password) {
      return API.post('/api/auth/login', { email, password });
    },
    
    logout() {
      return API.post('/api/auth/logout');
    },
    
    me() {
      return API.get('/api/auth/me');
    }
  },
  
  // User endpoints
  users: {
    get(id) {
      return API.get(`/api/users/${id}`);
    },
    
    update(id, data) {
      return API.put(`/api/users/${id}`, data);
    }
  },
  
  // Psychologist endpoints
  psychologists: {
    search(filters = {}) {
      const params = new URLSearchParams(filters);
      return API.get(`/api/psychologists/search?${params}`);
    },
    
    get(id) {
      return API.get(`/api/psychologists/${id}`);
    },
    
    getByUserId(userId) {
      return API.get(`/api/psychologists/user/${userId}`);
    },
    
    create(data) {
      return API.post('/api/psychologists', data);
    },
    
    update(id, data) {
      return API.put(`/api/psychologists/${id}`, data);
    }
  },
  
  // Appointment endpoints
  appointments: {
    create(data) {
      return API.post('/api/appointments', data);
    },
    
    getByClient(clientId) {
      return API.get(`/api/appointments/client/${clientId}`);
    },
    
    getByPsychologist(psychologistId) {
      return API.get(`/api/appointments/psychologist/${psychologistId}`);
    },
    
    update(id, data) {
      return API.put(`/api/appointments/${id}`, data);
    }
  },
  
  // Review endpoints
  reviews: {
    create(data) {
      return API.post('/api/reviews', data);
    },
    
    getByPsychologist(psychologistId) {
      return API.get(`/api/reviews/psychologist/${psychologistId}`);
    }
  },
  
  // Message endpoints
  messages: {
    create(data) {
      return API.post('/api/messages', data);
    },
    
    getBetween(user1Id, user2Id) {
      return API.get(`/api/messages/${user1Id}/${user2Id}`);
    }
  },
  
  // Availability endpoints
  availability: {
    create(data) {
      return API.post('/api/availability', data);
    },
    
    getByPsychologist(psychologistId) {
      return API.get(`/api/availability/psychologist/${psychologistId}`);
    }
  },
  
  // Admin endpoints
  admin: {
    getUsers() {
      return API.get('/api/admin/users');
    },
    
    getPendingPsychologists() {
      return API.get('/api/admin/psychologists/pending');
    },
    
    approvePsychologist(id) {
      return API.put(`/api/admin/psychologists/${id}/approve`);
    },
    
    rejectPsychologist(id) {
      return API.delete(`/api/admin/psychologists/${id}/reject`);
    },
    
    blockUser(id) {
      return API.put(`/api/admin/users/${id}/block`);
    },
    
    unblockUser(id) {
      return API.put(`/api/admin/users/${id}/unblock`);
    },
    
    getStats() {
      return API.get('/api/admin/stats');
    }
  }
};
