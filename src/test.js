'use strict';

require('dotenv').config();

const io = require('socket.io-client');

const BASE_URL = process.env.BASE_URL;

const EXTENSION = process.env.EXTENSION;

const client = io.connect(`${BASE_URL}/${EXTENSION}`);

client.emit('message', 'sending a message');

client.on('messageOut', (message) => {
  console.log(message);
})


