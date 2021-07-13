'use stict';

require('dotenv').config();
const { Server } = require('socket.io');
const PORT = process.env.PORT || 3000;
const server = new Server(PORT, {
  cors:
  {
    origin: ['https://60ee06c0fbbe4d701705e7ff--anony-message.netlify.app'],
    methods: ['GET']
  }
});

module.exports = server;
