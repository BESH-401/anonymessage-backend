'use strict';

require('dotenv').config();
const io = require('socket.io-client');
const BASE_URL = process.env.BASE_URL;
const EXTENSION = process.env.EXTENSION;
const client = io.connect(`${BASE_URL}/${EXTENSION}`);

// ========= TEST VARIABLES/OBJECTS CREATED BELOW =========

// This variable for messages
const messageVariable = {
  "message": "/people",
  "username": "Susan"
}

// ========= BELOW EVENTS DEAL WITH INITIAL LOGIN AND DB MESSAGE COLLECTION =========
client.emit('initialLogin', messageVariable);
client.on('initialLogin', (message) => {
  for (let i = 0; i < message.storedMessages.length; i++) {
    console.log(message.storedMessages[i].message);
  }
});

// ========= ALL EVENTS BELOW DEAL WITH CLIENT MESSAGE EXCHANGES =========
client.emit('message', messageVariable);
client.on('messageOut', (message) => {
  console.log(message);
});
