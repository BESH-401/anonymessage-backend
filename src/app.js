'use strict';

console.log('Hello World');

const server = require('./server.js');

const messageApp = server.of('/messageApp');

messageApp.on('connection', (socket) => {
  console.log(`${socket.id} has connected`);

  socket.on('message', (message) => {
    // console.logging incoming message
    console.log(message);
    messageApp.emit('messageOut', message);
  })
})


