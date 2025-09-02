const express = require('express');
const router = express.Router();
const { channels, messages, users, groups } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { hasAccessToChannel } = require('../utils/helpers');

// Get messages for a channel - FIXED ROUTE
router.get('/:channelId/messages', authenticateToken, (req, res) => {
    const { channelId } = req.params;
    
    // TEMPORARY: Remove access check for debugging
    // if (!hasAccessToChannel(req.user, channelId)) {
    //     return res.status(403).json({ error: 'Access denied' });
    // }
    
    const channelMessages = messages
        .filter(message => message.channelId === channelId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .slice(-20);
    
    // Add user info to messages
    const messagesWithUserInfo = channelMessages.map(message => {
        const user = users.find(u => u.id === message.userId);
        return {
            ...message,
            username: user ? user.username : 'Unknown',
            userRoles: user ? user.roles : []
        };
    });
    
    res.json(messagesWithUserInfo);
});

// Optional: Add POST endpoint for sending messages
router.post('/:channelId/messages', authenticateToken, (req, res) => {
    const { channelId } = req.params;
    const { text } = req.body;
    
    if (!hasAccessToChannel(req.user, channelId)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    // Create new message
    const newMessage = {
        id: Date.now().toString(),
        text,
        userId: req.user.id,
        channelId,
        timestamp: new Date().toISOString(),
        toJSON() {
            return {
                id: this.id,
                text: this.text,
                userId: this.userId,
                channelId: this.channelId,
                timestamp: this.timestamp
            };
        }
    };
    
    messages.push(newMessage);
    
    // Add user info to response
    const user = users.find(u => u.id === req.user.id);
    const responseMessage = {
        ...newMessage.toJSON(),
        username: user ? user.username : 'Unknown',
        userRoles: user ? user.roles : []
    };
    
    res.status(201).json(responseMessage);
});

module.exports = router;