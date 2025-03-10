const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favoriteGenres: { type: [String], default: [] },
    ratings: [{
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        rating: { type: Number, min: 1, max: 5 }
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;