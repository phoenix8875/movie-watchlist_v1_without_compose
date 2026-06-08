const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to PostgreSQL using Docker's internal networking
// "postgres-db" will be the container name we use later
const pool = new Pool({
  host: 'postgres-db', 
  user: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'Fuckcomviva',
  database: process.env.POSTGRES_DB || 'watchlist_db',
  port: 5432,
});

// Automatically create the table if it doesn't exist
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL
      );
    `);
    console.log("Database table initialized successfully.");
  } catch (err) {
    console.error("Database table initialization waiting for Postgres connection...", err.message);
  }
};
setTimeout(initDb, 5000); // 5-second delay to let Postgres boot up first

// Route to get all movies
app.get('/api/movies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to add a movie
app.post('/api/movies', async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query('INSERT INTO movies (title) VALUES ($1) RETURNING *', [title]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Route to delete a movie by ID
app.delete('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM movies WHERE id = $1', [id]);
    res.json({ message: `Movie with ID ${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
