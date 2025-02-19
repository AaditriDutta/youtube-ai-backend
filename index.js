const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// Video Schema & Model
const videoSchema = new mongoose.Schema({
    title: String,
    url: String
});

const Video = mongoose.model('Video', videoSchema);

// User Schema & Model
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// 🔹 API Route: Get All Videos
app.get('/api/videos', async (req, res) => {
    try {
        const videos = await Video.find();
        res.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 🔹 API Route: Add New Video
app.post('/api/videos', async (req, res) => {
    try {
        const { title, url } = req.body;
        const newVideo = new Video({ title, url });
        await newVideo.save();
        res.status(201).json(newVideo);
    } catch (error) {
        console.error('Error saving video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 🔹 User Signup
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 🔹 User Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
