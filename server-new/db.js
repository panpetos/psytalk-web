// MySQL Database Connection
const { loadEnv } = require('./loadEnv');
const mysql = require('mysql2/promise');

// Ensure environment variables from .env are available before configuring the pool
loadEnv();

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u3105470_psyh_user',
  password: process.env.DB_PASSWORD || 'xR3iA0zO0qwV9cF4',
  database: process.env.DB_NAME || 'u3105470_psyh',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Successfully connected to MySQL database');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Failed to connect to MySQL database:', error.message);
    return false;
  }
}

// Initialize database (create tables if they don't exist)
async function initDatabase() {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Read and execute schema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        await pool.query(statement);
      }
      
      console.log('✓ Database schema initialized');
    }
  } catch (error) {
    console.error('✗ Failed to initialize database:', error.message);
    throw error;
  }
}

// Execute query helper
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

// Get single row
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

module.exports = {
  pool,
  query,
  queryOne,
  testConnection,
  initDatabase
};
