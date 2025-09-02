// config/database.js

const User = require('../models/User');
const Group = require('../models/Group');
const Channel = require('../models/Channel');
const Message = require('../models/message');
const { ROLES } = require('../utils/constants');

class Database {
    constructor() {
        // In-memory data storage
        this.users = [];
        this.groups = [];
        this.channels = [];
        this.messages = [];
        
        // Call initialization as soon as the class is instantiated
        this.initializeData();
    }

    async initializeData() {
        try {
            // Create default super admin
            const superAdmin = new User('super', '123', 'super@admin.com', [ROLES.SUPER_ADMIN]);
            await superAdmin.setPassword('123');
            this.users.push(superAdmin);
            
            // Create sample groups
            const generalGroup = new Group('General', superAdmin.id, 'General discussion group');
            const techGroup = new Group('Technology', superAdmin.id, 'Tech enthusiasts group');
            this.groups.push(generalGroup, techGroup);
            
            // Add super admin to groups
            superAdmin.addToGroup(generalGroup.id);
            superAdmin.addToGroup(techGroup.id);
            
            // Create sample channels
            const welcomeChannel = new Channel('welcome', generalGroup.id, superAdmin.id);
            const randomChannel = new Channel('random', generalGroup.id, superAdmin.id);
            const jsChannel = new Channel('javascript', techGroup.id, superAdmin.id);
            this.channels.push(welcomeChannel, randomChannel, jsChannel);
            
            // Create sample messages
            const welcomeMessage = new Message('Welcome to our chat application!', superAdmin.id, welcomeChannel.id);
            const secondMessage = new Message('This is a sample message', superAdmin.id, welcomeChannel.id);
            this.messages.push(welcomeMessage, secondMessage);
            
            console.log('Database initialized with sample data');
            console.log('Default super admin: username: super, password: 123');
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }
}

// Export a single instance of the Database class
module.exports = new Database();