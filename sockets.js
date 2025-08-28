module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle chat messages
    socket.on('chatMessage', (message) => {
      console.log('Message received:', message);
      
      // Broadcast message to all connected clients
      io.emit('message', message);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};