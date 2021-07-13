'use stict';

require('dotenv').config();
const { Server } = require('socket.io');
const PORT = process.env.PORT || 3000;
const server = new Server(PORT, {
  cors:
  {
    origin: ['https://anony-message-backend.herokuapp.com'],
    methods: ['GET']
  }
});

module.exports = server;
