const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: String,
    description: String,
    url: String,
    views: Number,
    likes: Number
});

module.exports = mongoose.model('Video', videoSchema);
