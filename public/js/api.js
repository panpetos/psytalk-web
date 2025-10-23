// API Client Module

const API = {
  baseURL: '',

  // Generic fetch wrapper
  async request(method, url, data = null, { headers = {}, credentials } = {}) {
    const hasBody = data !== null && data !== undefined && method !== 'GET' && method !== 'HEAD';
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

    const requestHeaders = {
      Accept: 'application/json',
      ...headers
    };

    if (hasBody && !isFormData) {
      requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
    }

    const options = {
      method,
      headers: requestHeaders,
      credentials: credentials || 'include'
    };

    if (hasBody) {
      options.body = isFormData ? data : JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      let responseData = null;

      if (response.status !== 204) {
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (isJson) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          try {
            responseData = text ? JSON.parse(text) : null;
          } catch (parseError) {
            responseData = text;
          }
        }
      }

      if (!response.ok) {
        const message =
          (responseData && (responseData.error || responseData.message)) ||
          `HTTP error! status: ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        error.response = responseData;
        throw error;
      }

      return responseData;
    } catch (error) {
      if (!error.status) {
        error.status = 0;
      }
      console.error('API Error:', error);
      throw error;
    }
  },

  shouldFallback(error) {
    if (!error) return false;
    if (error.status === 404 || error.status === 405) {
      return true;
    }
    if (error.status === 0 && error.name === 'TypeError') {
      return true;
    }
    if (typeof error.message === 'string' && error.message.includes('Failed to fetch')) {
      return true;
    }
    return false;
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
      const payload = { ...data };
      const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();

      if (!payload.name && fullName) {
        payload.name = fullName;
      }

      if (payload.role === 'client') {
        payload.role = 'user';
      }

      return API.request('POST', '/api/auth.php?action=register', payload).catch((error) => {
        if (!API.shouldFallback(error)) {
          throw error;
        }
        return API.request('POST', '/api/auth/register', data);
      });
    },

    login(email, password) {
      return API.request('POST', '/api/auth.php?action=login', { email, password }).catch((error) => {
        if (!API.shouldFallback(error)) {
          throw error;
        }
        return API.request('POST', '/api/auth/login', { email, password });
      });
    },

    logout() {
      return API.request('POST', '/api/auth.php?action=logout').catch((error) => {
        if (!API.shouldFallback(error)) {
          throw error;
        }
        return API.request('POST', '/api/auth/logout');
      });
    },

    me() {
      return API.request('GET', '/api/auth.php?action=me').catch((error) => {
        if (!API.shouldFallback(error)) {
          throw error;
        }
        return API.request('GET', '/api/auth/me');
      });
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
