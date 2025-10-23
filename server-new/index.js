// PsychPlatform Server - JavaScript Version
const { loadEnv } = require('./loadEnv');
loadEnv();

const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Try to import database modules, fallback to demo mode
let pool, testConnection, initDatabase, registerRoutes;
let DEMO_MODE = false;

try {
  const db = require('./db');
  pool = db.pool;
  testConnection = db.testConnection;
  initDatabase = db.initDatabase;
  const routes = require('./routes');
  registerRoutes = routes.registerRoutes;
} catch (error) {
  console.warn('⚠ Database modules not available, running in DEMO mode');
  DEMO_MODE = true;
}

// Session middleware - use memory store in demo mode
if (DEMO_MODE) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'demo-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
} else {
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
}

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
    
    if (DEMO_MODE) {
      console.log('⚠ RUNNING IN DEMO MODE (No Database)');
      console.log('ℹ This is a static preview of the interface');
      console.log('ℹ To enable full functionality, deploy to a MySQL server');
      console.log('ℹ See DEPLOYMENT_REG_RU.md for instructions\n');
    } else {
      // Test database connection
      const connected = await testConnection();
      if (!connected) {
        console.log('\n⚠ MySQL not available, switching to DEMO mode');
        console.log('ℹ Static pages will be served, but API will not work');
        console.log('ℹ To enable full functionality, deploy to a MySQL server\n');
        DEMO_MODE = true;
      } else {
        // Initialize database schema
        await initDatabase();
        
        // Register API routes
        registerRoutes(app);
      }
    }
    
    // Serve static files from public directory
    app.use(express.static(path.join(__dirname, '../public')));
    
    // Catch-all route - serve index.html for SPA routing
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../public/index.html'));
      } else if (DEMO_MODE) {
        // In demo mode, return informative error for API calls
        res.status(503).json({ 
          error: 'Demo mode: Database not available', 
          message: 'Deploy to a MySQL server for full functionality. See DEPLOYMENT_REG_RU.md' 
        });
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
      console.log(`✓ Server running on http://0.0.0.0:${port}`);
      console.log(`✓ Public files served from /public`);
      
      if (DEMO_MODE) {
        console.log('\n📄 DEMO MODE - Static pages only');
        console.log('   Open http://0.0.0.0:${port} to see the interface');
        console.log('   Deploy to MySQL for full functionality');
      } else {
        console.log('\n✓ MySQL connected');
        console.log('\nDemo accounts:');
        console.log('Admin:        admin@psychplatform.com / admin123');
        console.log('Psychologist: anna.petrova@psychplatform.com / psychologist123');
        console.log('Psychologist: mikhail.sidorov@psychplatform.com / psychologist123');
        console.log('Client:       maria.ivanova@example.com / client123');
      }
      console.log('\n');
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
