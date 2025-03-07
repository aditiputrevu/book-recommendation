const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    release_date: { type: Date, required: true },
    popularity: { type: Number, required: true, min: 1, max: 10 },
    mood: { type: String, required: true },
    cover: { type: String, required: true },
    description: { type: String }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
