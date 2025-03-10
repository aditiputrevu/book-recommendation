const fs = require('fs');
const csv = require('csv-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Book = require('./models/book');
const User = require('./models/user');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('MongoDB connection error:', error));

// Middleware to authenticate JWT
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// Load books from CSV into MongoDB
app.post('/api/load-books', async (req, res) => {
    try {
        const books = [];

        // Read the CSV file
        fs.createReadStream('best-selling-books.csv')
            .pipe(csv())
            .on('data', (row) => {
                // Map CSV fields to Book schema
                const book = {
                    title: row.Book,
                    author: row['Author(s)'],
                    genre: row.Genre,
                    release_date: new Date(row['First published']),
                    popularity: parseFloat(row['Approximate sales in millions']),
                    mood: assignMood(row.Genre), // Assign mood based on genre
                    cover: `https://example.com/${row.Book.toLowerCase().replace(/ /g, '-')}.jpg`, // Placeholder cover URL
                    description: `A bestselling book in the genre of ${row.Genre}.` // Placeholder description
                };
                books.push(book);
            })
            .on('end', async () => {
                // Insert books into MongoDB
                await Book.insertMany(books);
                res.json({ message: 'Books loaded successfully.', count: books.length });
            });
    } catch (error) {
        res.status(500).json({ message: 'Error loading books', error });
    }
});

// Function to assign mood based on genre
function assignMood(genre) {
    const moodMap = {
        'Fantasy': 'happy',
        'Mystery': 'anxious',
        'Romance': 'happy',
        'Historical fiction': 'reflective',
        'Dystopian': 'anxious',
        'Children\'s fiction': 'happy',
        'Self-help': 'neutral',
        'Science fiction': 'excited',
        'Thriller': 'anxious',
        'Biography': 'reflective'
    };

    // Default mood if genre is not found
    return moodMap[genre] || 'neutral';
}

// Existing routes (user registration, login, book recommendations, etc.)
// ...

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});