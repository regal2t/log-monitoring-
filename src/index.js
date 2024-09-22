const http = require('http');
const os = require('os');
const { Pool } = require('pg'); // Import the pg module for connection pooling
const querystring = require('querystring'); // Import for parsing form data

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

// Function to fetch movies by release year
const fetchMovies = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT * FROM movies ORDER BY release_year ASC');
    client.release();
    return res.rows;
  } catch (err) {
    console.error('Error fetching movies:', err);
    return [];
  }
};

// Function to insert a new movie
const insertMovie = async (name, release_year) => {
  try {
    const client = await pool.connect();
    await client.query('INSERT INTO movies (name, release_year) VALUES ($1, $2)', [name, release_year]);
    client.release();
    return 'Movie inserted successfully';
  } catch (err) {
    console.error('Error inserting movie:', err);
    return 'Failed to insert movie';
  }
};

const server = http.createServer(async (req, res) => {
  try {
    const dbMessage = await connectToDatabase(); // Connect to the database
    
    if (req.method === 'POST') {
      // Handle form submission (insert movie into the DB)
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        const { name, release_year } = querystring.parse(body); // Parse form data
        const insertMessage = await insertMovie(name, release_year); // Insert movie

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(`
          <p>${insertMessage}</p>
          <a href="/">Go Back</a>
        `);
      });
    } else {
      // Show the HTML form and movie list
      const movies = await fetchMovies();
      const movieListHtml = movies.map(movie => `<li>${movie.name} (Released: ${movie.release_year})</li>`).join('');

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(`
        <h1>Hello, ${hostname}</h1>
        <p>${dbMessage}</p>
        <h2>Add a new movie</h2>
        <form method="POST" action="/">
          <label for="name">Movie Name:</label><br>
          <input type="text" id="name" name="name" required><br><br>
          <label for="release_year">Release Year:</label><br>
          <input type="number" id="release_year" name="release_year" required><br><br>
          <input type="submit" value="Submit">
        </form>
        
        <h2>Movie List</h2>
        <ul>
          ${movieListHtml}
        </ul>
      `);
    }
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Error: ${error.message}\n`);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on host ${hostname} at http://0.0.0.0:${port}/`);
});
