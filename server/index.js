// PsychPlatform Server - JavaScript Version
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const { pool, testConnection, initDatabase } = require('./db');
const { registerRoutes } = require('./routes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MySQL Session Store
const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 86400000, // 24 hours
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool);

// Session middleware
app.use(session({
  key: 'session_id',
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// Initialize database and routes
async function startServer() {
  try {
    console.log('\n=== Starting PsychPlatform Server ===\n');
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }
    
    // Initialize database schema
    await initDatabase();
    
    // Register API routes
    registerRoutes(app);
    
    // Serve static files from public directory
    app.use(express.static(path.join(__dirname, '../public')));
    
    // Catch-all route - serve index.html for SPA routing
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../public/index.html'));
      }
    });
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      
      console.error('Error:', message);
      res.status(status).json({ error: message });
    });
    
    // Start server
    const port = parseInt(process.env.PORT || '5000', 10);
    app.listen(port, '0.0.0.0', () => {
      console.log(`\n✓ Server running on http://0.0.0.0:${port}`);
      console.log(`✓ Public files served from /public`);
      console.log('\nDemo accounts:');
      console.log('Admin:        admin@psychplatform.com / admin123');
      console.log('Psychologist: anna.petrova@psychplatform.com / psychologist123');
      console.log('Psychologist: mikhail.sidorov@psychplatform.com / psychologist123');
      console.log('Client:       maria.ivanova@example.com / client123');
      console.log('\n');
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
