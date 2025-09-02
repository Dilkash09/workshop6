const express = require('express');
const router = express.Router();
const { users, groups } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(ROLES.SUPER_ADMIN), (req, res) => {
    const usersWithoutPasswords = users.map(user => user.toJSON());
    res.json(usersWithoutPasswords);
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
    res.json(req.user.toJSON());
});

// Promote user to admin
router.post('/:userId/promote', authenticateToken, requireRole(ROLES.SUPER_ADMIN), (req, res) => {
    const { userId } = req.params;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.hasRole(ROLES.GROUP_ADMIN)) {
        user.roles.push(ROLES.GROUP_ADMIN);
        res.json({ message: 'User promoted to group admin' });
    } else {
        res.status(400).json({ error: 'User is already an admin' });
    }
});

// **NEW ENDPOINT: Promote user to Super Admin**
router.post('/:userId/promote-super', authenticateToken, requireRole(ROLES.SUPER_ADMIN), (req, res) => {
    const { userId } = req.params;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.hasRole(ROLES.SUPER_ADMIN)) {
        user.roles.push(ROLES.SUPER_ADMIN);
        res.json({ message: 'User promoted to super admin' });
    } else {
        res.status(400).json({ error: 'User is already a super admin' });
    }
});




// Delete user
router.delete('/:userId', authenticateToken, requireRole(ROLES.SUPER_ADMIN), (req, res) => {
    const { userId } = req.params;
    
    if (userId === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove user from all groups
    groups.forEach(group => {
        group.removeMember(userId);
    });
    
    users.splice(userIndex, 1);
    res.json({ message: 'User deleted successfully' });
});

module.exports = router;