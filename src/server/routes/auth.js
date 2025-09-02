const express = require('express');
const router = express.Router();
const { users } = require('../config/database');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const User = require('../models/User');
// User registration
router.post('/register', validateRegistration, async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        // Check if username already exists
        if (users.some(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Create new user
        const newUser = new User(username, password, email);
        await newUser.setPassword(password);
        users.push(newUser);
        
        res.status(201).json({
            ...newUser.toJSON(),
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User login
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const validPassword = await user.validatePassword(password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // For this demo, we'll just return the user ID as a token
        res.json({
            token: user.id,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;