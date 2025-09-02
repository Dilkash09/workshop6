const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups'); // This file should contain both group and channel-creation routes
const messageRoutes = require('./routes/messages');

// Import middleware
const { authenticateToken } = require('./middleware/auth');

// Import database
const { initializeData, users, groups, channels, messages } = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

// Initialize database
initializeData();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes); // All group-related routes, including channel creation, are now mounted here
app.use('/api/channels', messageRoutes); // Channels and messages are related, so this is a fine setup

// Socket.io for real-time communication
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Join a channel room
    socket.on('join-channel', (data) => {
        socket.join(data.channelId);
        console.log(`User ${data.userId} joined channel ${data.channelId}`);
    });
    
    // Leave a channel room
    socket.on('leave-channel', (data) => {
        socket.leave(data.channelId);
        console.log(`User ${data.userId} left channel ${data.channelId}`);
    });
    
    // Handle new messages
    socket.on('send-message', async (data) => {
        try {
            const { channelId, userId, text } = data;
            
            // Verify user has access to this channel
            const channel = channels.find(c => c.id === channelId);
            if (!channel) {
                socket.emit('error', { message: 'Channel not found' });
                return;
            }
            
            const group = groups.find(g => g.id === channel.groupId);
            if (!group) {
                socket.emit('error', { message: 'Group not found' });
                return;
            }
            
            const user = users.find(u => u.id === userId);
            if (!user || (!user.isMemberOfGroup(group.id) && 
                !user.hasRole('super_admin') && 
                group.createdBy !== user.id)) {
                socket.emit('error', { message: 'Access denied' });
                return;
            }
            
            // Create new message
            const newMessage = new Message(text, userId, channelId);
            messages.push(newMessage);
            
            // Broadcast to all users in the channel
            io.to(channelId).emit('new-message', {
                ...newMessage.toJSON(),
                username: user.username,
                userRoles: user.roles
            });
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
