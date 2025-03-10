require('dotenv').config();
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

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, favoriteGenres } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'User already exists.' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({ username, password: hashedPassword, favoriteGenres });
        await user.save();

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid username or password.' });

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid username or password.' });

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// GET /api/books - Fetch books based on mood, genre, and popularity
app.get('/api/books', authenticate, async (req, res) => {
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
app.post('/api/books', authenticate, async (req, res) => {
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

// POST /api/rate - Rate a book
app.post('/api/rate', authenticate, async (req, res) => {
    try {
        const { bookId, rating } = req.body;

        // Validate rating
        if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5.' });

        // Find the user and update their ratings
        const user = await User.findById(req.user.userId);
        user.ratings.push({ bookId, rating });
        await user.save();

        res.json({ message: 'Book rated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error rating book', error });
    }
});

// GET /api/recommendations - Get personalized book recommendations
app.get('/api/recommendations', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('ratings.bookId');

        // Get user's favorite genres and moods
        const favoriteGenres = user.favoriteGenres;
        const moods = user.ratings.map(rating => rating.bookId.mood);

        // Find books that match the user's preferences
        const recommendations = await Book.find({
            genre: { $in: favoriteGenres },
            mood: { $in: moods }
        }).limit(10);

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recommendations', error });
    }
});

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});