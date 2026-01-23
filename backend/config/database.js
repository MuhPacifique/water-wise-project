const mysql = require('mysql2/promise');

let pool;

const initializeDatabase = async () => {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'water_wise_db',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle database connection', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
      console.log('Database connection lost. Attempting to reconnect...');
      // The pool handles reconnection automatically for new requests
    } else {
      process.exit(-1);
    }
  });

  // Test connection
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

const getPool = () => pool;

module.exports = { initializeDatabase, getPool };
