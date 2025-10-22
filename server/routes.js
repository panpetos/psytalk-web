// API Routes
const bcrypt = require('bcrypt');
const { MySQLStorage } = require('./storage');

const storage = new MySQLStorage();

// Simple validation helpers
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

function registerRoutes(app) {
  
  // ========== AUTH ROUTES ==========
  
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, role, firstName, lastName } = req.body;
      
      // Validate input
      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
      
      if (!validatePassword(password)) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      
      if (!['client', 'psychologist', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required' });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        role,
        firstName,
        lastName,
        avatar: req.body.avatar || null
      });
      
      // If user is a psychologist, create psychologist profile
      if (role === 'psychologist') {
        await storage.createPsychologist({
          userId: user.id,
          specialization: 'Не указана',
          experience: 0,
          education: 'Не указано',
          description: 'Заполните профиль',
          price: '0.00',
          formats: ['video'],
          certifications: []
        });
      }
      
      // Remove password from response
      delete user.password;
      res.status(201).json(user);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Set user session
      req.session.userId = user.id;
      
      // Remove password from response
      const safeUser = { ...user };
      delete safeUser.password;
      res.json(safeUser);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    delete user.password;
    res.json(user);
  });

  app.post('/api/auth/logout', async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Could not log out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // ========== USER ROUTES ==========
  
  app.get('/api/users/:id', async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    delete user.password;
    res.json(user);
  });

  app.put('/api/users/:id', async (req, res) => {
    const updates = req.body;
    const user = await storage.updateUser(req.params.id, updates);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    delete user.password;
    res.json(user);
  });

  // ========== PSYCHOLOGIST ROUTES ==========
  
  app.post('/api/psychologists', async (req, res) => {
    try {
      const psychologist = await storage.createPsychologist(req.body);
      res.status(201).json(psychologist);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/psychologists/search', async (req, res) => {
    const { specialization, minPrice, maxPrice, formats } = req.query;
    
    const filters = { isApproved: true };
    
    if (specialization) filters.specialization = specialization;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (formats) {
      filters.formats = Array.isArray(formats) ? formats : [formats];
    }
    
    const psychologists = await storage.searchPsychologists(filters);
    res.json(psychologists);
  });

  app.get('/api/psychologists/:id', async (req, res) => {
    const psychologist = await storage.getPsychologist(req.params.id);
    if (!psychologist) {
      return res.status(404).json({ error: 'Psychologist not found' });
    }
    
    const user = await storage.getUser(psychologist.user_id || psychologist.userId);
    res.json({ ...psychologist, user });
  });

  app.get('/api/psychologists/user/:userId', async (req, res) => {
    const psychologist = await storage.getPsychologistByUserId(req.params.userId);
    if (!psychologist) {
      return res.status(404).json({ error: 'Psychologist profile not found' });
    }
    
    const user = await storage.getUser(psychologist.user_id || psychologist.userId);
    res.json({ ...psychologist, user });
  });

  app.put('/api/psychologists/:id', async (req, res) => {
    const updates = req.body;
    const psychologist = await storage.updatePsychologist(req.params.id, updates);
    
    if (!psychologist) {
      return res.status(404).json({ error: 'Psychologist not found' });
    }
    
    res.json(psychologist);
  });

  // ========== APPOINTMENT ROUTES ==========
  
  app.post('/api/appointments', async (req, res) => {
    try {
      const appointment = await storage.createAppointment(req.body);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/appointments/client/:clientId', async (req, res) => {
    const appointments = await storage.getAppointmentsByClient(req.params.clientId);
    res.json(appointments);
  });

  app.get('/api/appointments/psychologist/:psychologistId', async (req, res) => {
    const appointments = await storage.getAppointmentsByPsychologist(req.params.psychologistId);
    res.json(appointments);
  });

  app.put('/api/appointments/:id', async (req, res) => {
    const updates = req.body;
    const appointment = await storage.updateAppointment(req.params.id, updates);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(appointment);
  });

  // ========== REVIEW ROUTES ==========
  
  app.post('/api/reviews', async (req, res) => {
    try {
      const review = await storage.createReview(req.body);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/reviews/psychologist/:psychologistId', async (req, res) => {
    const reviews = await storage.getReviewsByPsychologist(req.params.psychologistId);
    res.json(reviews);
  });

  // ========== MESSAGE ROUTES ==========
  
  app.post('/api/messages', async (req, res) => {
    try {
      const message = await storage.createMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/messages/:user1Id/:user2Id', async (req, res) => {
    const messages = await storage.getMessagesBetween(req.params.user1Id, req.params.user2Id);
    res.json(messages);
  });

  // ========== AVAILABILITY ROUTES ==========
  
  app.post('/api/availability', async (req, res) => {
    try {
      const availability = await storage.createAvailability(req.body);
      res.status(201).json(availability);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/availability/psychologist/:psychologistId', async (req, res) => {
    const availability = await storage.getAvailabilityByPsychologist(req.params.psychologistId);
    res.json(availability);
  });

  // ========== ADMIN ROUTES ==========
  
  app.get('/api/admin/users', async (req, res) => {
    const users = await storage.getAllUsers();
    const safeUsers = users.map(user => {
      const safe = { ...user };
      delete safe.password;
      return safe;
    });
    res.json(safeUsers);
  });

  app.get('/api/admin/psychologists/pending', async (req, res) => {
    const pending = await storage.getPendingPsychologists();
    res.json(pending);
  });

  app.put('/api/admin/psychologists/:id/approve', async (req, res) => {
    await storage.approvePsychologist(req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/admin/psychologists/:id/reject', async (req, res) => {
    try {
      await storage.rejectPsychologist(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to reject psychologist' });
    }
  });

  // ========== STATS ROUTES ==========
  
  app.get('/api/admin/stats', async (req, res) => {
    try {
      // Get all users and psychologists for stats
      const users = await storage.getAllUsers();
      const psychologists = await storage.searchPsychologists({ isApproved: true });
      
      const stats = {
        totalUsers: users.length,
        totalClients: users.filter(u => u.role === 'client').length,
        totalPsychologists: psychologists.length,
        pendingPsychologists: (await storage.getPendingPsychologists()).length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  return app;
}

module.exports = { registerRoutes };
