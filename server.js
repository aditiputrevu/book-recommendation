require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Book = require('./models/book');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('MongoDB connection error:', error));

app.get('/api/books', async (req, res) => {
    try {
        const { mood, genre, popularity } = req.query;
        const filters = {};
        if (mood) filters.mood = mood;
        if (genre) filters.genre = genre;
        if (popularity) filters.popularity = { $gte: parseInt(popularity) };

        const books = await Book.find(filters);
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error });
    }
});

// POST API to add books
app.post('/api/books', async (req, res) => {
    try {
        const { title, author, genre, release_date, popularity, mood, cover, description } = req.body;
        const newBook = new Book({ title, author, genre, release_date, popularity, mood, cover, description });
        await newBook.save();
        res.status(201).json({ message: 'Book added successfully', book: newBook });
    } catch (error) {
        res.status(500).json({ message: 'Error adding book', error });
    }
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
