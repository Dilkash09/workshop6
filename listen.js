module.exports = function(server) {
  const PORT = process.env.PORT || 3000;
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket server ready for connections`);
  });
};