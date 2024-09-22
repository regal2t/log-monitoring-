const http = require('http');
const os = require('os');
const { Pool } = require('pg'); // Import the pg module for connection pooling

const hostname = os.hostname();
const port = 8000;

// PostgreSQL connection configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  user: process.env.POSTGRES_USER || 'your_username',
  password: process.env.POSTGRES_PASSWORD || 'your_password',
  database: process.env.POSTGRES_DB || 'your_database',
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
};

// Create a connection pool
const pool = new Pool(dbConfig);

// Function to connect to the PostgreSQL database
const connectToDatabase = async () => {
  try {
    const client = await pool.connect(); // Use the pool to get a client
    await client.query('SELECT NOW()'); // Test the connection
    client.release(); // Release the client back to the pool
    console.log('DB connected successfully');
    return 'DB connected successfully';
  } catch (err) {
    console.error('Error connecting to the database:', err);
    return 'Failed to connect to DB';
  }
};

const server = http.createServer(async (req, res) => {
  try {
    const dbMessage = await connectToDatabase(); // Connect to the database

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Hello, ${hostname}\n${dbMessage}\n this is version 33`);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Error: ${error.message}\n`);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on host ${hostname} at http://0.0.0.0:${port}/`);
});


