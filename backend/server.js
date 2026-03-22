const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors'); 

const app = express();

app.use(cors()); 
app.use(express.json());
app.use(express.static('public'));

// Database connection using environment variables from Docker
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Initialize table
async function initDB() {
    const conn = await pool.getConnection();
    await conn.query('CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, text TEXT)');
    conn.release();
}
initDB();

app.get('/api/messages', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM messages');
    res.json(rows);
});

app.post('/api/messages', async (req, res) => {
    await pool.query('INSERT INTO messages (text) VALUES (?)', [req.body.text]);
    res.status(201).send('Saved!');
});

const port = process.env.PORT || 3000;
const host = '0.0.0.0'; 

app.listen(port, host, () => console.log('Backend running on port 8080'));
