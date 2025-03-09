require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Book = require('./models/book');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('MongoDB connection error:', error));

// GET /api/books - Fetch books based on mood, genre, and popularity
app.get('/api/books', async (req, res) => {
    try {
        const { mood, genre, popularity } = req.query;

        // Build the filter object
        const filters = {};
        if (mood) filters.mood = mood;
        if (genre && genre !== 'all') filters.genre = genre;
        if (popularity) filters.popularity = { $gte: parseInt(popularity) };

        // Fetch books from the database
        const books = await Book.find(filters);
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error });
    }
});

// POST /api/books - Add a new book to the database
app.post('/api/books', async (req, res) => {
    try {
        const { title, author, genre, release_date, popularity, mood, cover, description } = req.body;

        // Validate required fields
        if (!title || !author || !genre || !release_date || !popularity || !mood || !cover) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create a new book
        const newBook = new Book({ title, author, genre, release_date, popularity, mood, cover, description });
        await newBook.save();

        res.status(201).json({ message: 'Book added successfully', book: newBook });
    } catch (error) {
        res.status(500).json({ message: 'Error adding book', error });
    }
});

// Start the server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});