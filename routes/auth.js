const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = "Bund!123"; // Change this to a strong secret

// SIGNUP Route
router.post('/signup', [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Valid email required').isEmail(),
    body('password', 'Password must be 6+ characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword });

        await user.save();
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (error) {
        res.status(500).send("Server error");
    }
});

// LOGIN Route
router.post('/login', [
    body('email', 'Valid email required').isEmail(),
    body('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (error) {
        res.status(500).send("Server error");
    }
});

// PROTECTED Route Example (Requires Auth)
router.get('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization');
        if (!token) return res.status(401).json({ error: "Access denied" });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        res.json(user);
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
});

module.exports = router;
