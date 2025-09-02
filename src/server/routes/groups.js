const express = require('express');
const router = express.Router();
const { users, groups, channels } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateGroup, validateChannel } = require('../middleware/validation');
const { ROLES } = require('../utils/constants');
const { hasAccessToGroup } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

// Define the Group and Channel classes if they're not in a separate file
class Group {
    constructor(name, createdBy, description) {
        this.id = uuidv4();
        this.name = name;
        this.createdBy = createdBy;
        this.description = description;
        this.members = [createdBy];
        this.createdAt = new Date();
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            createdBy: this.createdBy,
            description: this.description,
            members: this.members,
            createdAt: this.createdAt
        };
    }
    isMember(userId) {
        return this.members.includes(userId);
    }
    addMember(userId) {
        if (!this.isMember(userId)) {
            this.members.push(userId);
            return true;
        }
        return false;
    }
    removeMember(userId) {
        const index = this.members.indexOf(userId);
        if (index !== -1) {
            this.members.splice(index, 1);
            return true;
        }
        return false;
    }
}

class Channel {
    constructor(name, groupId) {
        this.id = uuidv4();
        this.name = name;
        this.groupId = groupId;
        this.createdAt = new Date();
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            groupId: this.groupId,
            createdAt: this.createdAt
        };
    }
}

// Get all groups
router.get('/', authenticateToken, (req, res) => {
    let userGroups;
    if (req.user.hasRole(ROLES.SUPER_ADMIN)) {
        userGroups = groups;
    } else {
        userGroups = groups.filter(group => 
            req.user.isMemberOfGroup(group.id) || 
            group.createdBy === req.user.id
        );
    }
    res.json(userGroups.map(group => group.toJSON()));
});

// Create a new group
router.post('/', authenticateToken, validateGroup, (req, res) => {
    if (!req.user.hasRole(ROLES.SUPER_ADMIN) && !req.user.hasRole(ROLES.GROUP_ADMIN)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const { name, description } = req.body;
    const newGroup = new Group(name, req.user.id, description);
    groups.push(newGroup);
    req.user.addToGroup(newGroup.id);
    res.status(201).json(newGroup.toJSON());
});

// Get a specific group
router.get('/:groupId', authenticateToken, (req, res) => {
    const { groupId } = req.params;
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    if (!hasAccessToGroup(req.user, groupId)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    res.json(group.toJSON());
});

// Update an existing group
router.put('/:groupId', authenticateToken, (req, res) => {
    const { groupId } = req.params;
    const { name, description } = req.body;
    
    // Find the group to update
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check for permissions
    if (group.createdBy !== req.user.id && !req.user.hasRole(ROLES.SUPER_ADMIN)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Update the group properties
    if (name) {
        group.name = name;
    }
    if (description) {
        group.description = description;
    }
    
    // Return the updated group
    res.json(group.toJSON());
});

// Create a new channel within a group
router.post('/:groupId/channels', authenticateToken, validateChannel, (req, res) => {
    const { groupId } = req.params;
    const { name } = req.body;
    
    // Find the group to which the channel will be added
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check if the user has permission to create a channel in this group
    if (group.createdBy !== req.user.id && !req.user.hasRole(ROLES.SUPER_ADMIN)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Check if channel already exists with same name in this group
    const existingChannel = channels.find(c => 
        c.groupId === groupId && c.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingChannel) {
        return res.status(400).json({ error: 'Channel already exists in this group' });
    }
    
    // Create new channel
    const newChannel = new Channel(name, groupId);
    channels.push(newChannel);
    
    res.status(201).json(newChannel.toJSON());
});

// Get channels for a specific group
router.get('/:groupId/channels', authenticateToken, (req, res) => {
    const { groupId } = req.params;
    if (!hasAccessToGroup(req.user, groupId)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    const groupChannels = channels.filter(c => c.groupId === groupId);
    res.json(groupChannels.map(channel => channel.toJSON()));
});

// Delete a group
router.delete('/:groupId', authenticateToken, (req, res) => {
    const { groupId } = req.params;
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    if (group.createdBy !== req.user.id && !req.user.hasRole(ROLES.SUPER_ADMIN)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    const groupIndex = groups.findIndex(g => g.id === groupId);
    groups.splice(groupIndex, 1);
    res.json({ message: 'Group deleted successfully' });
});

// === GROUP MEMBERSHIP ROUTES ===

// Add user to group
router.post('/:groupId/members', authenticateToken, (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    
    // Find the group
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check permissions - only group creator or super admin can add members
    if (group.createdBy !== req.user.id && !req.user.hasRole(ROLES.SUPER_ADMIN)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Find the user to add
    const userToAdd = users.find(u => u.id === userId);
    if (!userToAdd) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Add user to group members
    if (group.addMember(userId)) {
        // Also add the group to user's groups if user has that method
        if (userToAdd.addToGroup) {
            userToAdd.addToGroup(groupId);
        }
        res.json({ 
            message: 'User added to group successfully', 
            group: group.toJSON() 
        });
    } else {
        res.status(400).json({ error: 'User is already a member of this group' });
    }
});

// Remove user from group
router.delete('/:groupId/members/:userId', authenticateToken, (req, res) => {
    const { groupId, userId } = req.params;
    
    // Find the group
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check permissions
    if (group.createdBy !== req.user.id && !req.user.hasRole(ROLES.SUPER_ADMIN)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Find the user to remove
    const userToRemove = users.find(u => u.id === userId);
    if (!userToRemove) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove user from group members
    if (group.removeMember(userId)) {
        // Also remove the group from user's groups if user has that method
        if (userToRemove.removeFromGroup) {
            userToRemove.removeFromGroup(groupId);
        }
        res.json({ 
            message: 'User removed from group successfully', 
            group: group.toJSON() 
        });
    } else {
        res.status(400).json({ error: 'User is not a member of this group' });
    }
});

// Get group members
router.get('/:groupId/members', authenticateToken, (req, res) => {
    const { groupId } = req.params;
    
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check if user has access to this group
    if (!hasAccessToGroup(req.user, groupId)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get detailed member information
    const groupMembers = users
        .filter(user => group.isMember(user.id))
        .map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles
        }));
    
    res.json(groupMembers);
});

module.exports = router;