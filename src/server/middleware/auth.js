// In-memory storage for demo (replace with database in Phase 2)
const database = require("../config/database");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    // For this demo, we'll use a simple user ID check
    const user = database.users.find(u => u.id === token);
    if (!user) {
        return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user.roles.includes(role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    requireRole
};