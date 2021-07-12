'use stict';

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const io =require ('socket.io');

const server = io(PORT);

module.exports = server;
