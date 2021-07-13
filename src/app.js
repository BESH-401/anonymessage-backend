'use strict';

require('dotenv').config();
const server = require('./server.js');
const messageApp = server.of('/messageApp');
const mongoose = require('mongoose');
const userModel = require('../model/user.js');
const ClientList = require('./ClientList.js');

// ================== Global Variables ==================

const CL = new ClientList();

// ================== Setting up MongoDB Connection ==================

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', () => console.error('Database connection lost!'));

db.once('open', function () {
  console.log('Database: Connected!');
});

// ================== Client Connection ==================

messageApp.on('connection', (socket) => {
  console.log(`Connection from: ${socket.id}`);

  // ================== Events for inital client login ==================

  // When user logs in with data in the database corresponding to their username, grab that user specific data, and sent back to the client.
  socket.on('initialLogin', (info) => {
    let username = info.username;
    socket.broadcast.emit('stringOut', `${username} has joined the chat.`)
    CL.add(username, socket.id);
    userModel.find({ name: username })
      .then(results => {
        if (results.length !== 0) {
          let storedMessages = results[0].messages;
          socket.emit('initialLogin', { storedMessages });
          results[0].messages = [];
          results[0].save();
        }
      });
  });

  // ================== Events for messaging between clients here ==================
  socket.on('message', (message) => {
    // console.logging incoming message
    console.log(`Incoming message from ${socket.id}: '${message.message}'`);

    // Testing if incoming message is a command with regex, if it is, tests the specific command with a switch and sends the user back a correct response.
    let regex = /^(\/[A-z]+)/g;
    if (regex.test(message.message)) {
      let temp = message.message.split(' ')[0];
      let commandRes = '';
      switch (temp) {
        case '/help':
          commandRes = 'To send a message to a specific person, use `@name` at the beginning of your message, and if the user is offline, will send the message to them when they come online. For a full list of commands, use: `/commands`.';
          break;
        case '/people':
          for (let i = 0; i < CL.clientList.length; i++) {
            if (commandRes === '') {
              commandRes = `Clients connnected to server: ${CL.clientList[i].name}`;
            } else {
              commandRes = `${commandRes}, ${CL.clientList[i].name}`;
            }
          }
          break;
        case '/commands':
          commandRes = '`/help` - Will inform the user of mentioning feature. `/people` - Will display a list of current aliases connected to the server. `/commands` - Will display a list of availiable commands';
          break;
        default:
          commandRes = 'Not a valid command. Try `/commands` for a list of commands.';
      }
      // Send command response to user
      socket.emit('stringOut', commandRes);
    }

    // Testing if incoming message is a direct message with regex, if it is, adds message to database under the mentioned name as the key and the message as the value for that object.
    regex = /^(@[A-Za-z]+)/g;
    if (regex.test(message.message)) {
      let temp = message.message.split(' ')[0];
      temp = temp.split('');
      temp = temp.splice(1, temp.length, '');
      temp = temp.join('');
      /*
      temp here equals the users name mentioned,
      below tests if mentioned name is connected to the server
      */
      let nameMatch = false;
      let current = 0;
      while (nameMatch === false && current < CL.clientList.length) {
        if (CL.clientList[current].name === temp) {
          nameMatch = true;
        }
        current++;
      }

      // If the name is not found in the connected clients list, adds message to database
      if (nameMatch === false) {
        userModel.find({ name: temp })
          .then(results => {
            // If the user doesn't exist in the database...
            if (results.length === 0) {
              const user = new userModel({
                name: temp,
                messages: { message: message.message }
              });
              user.save();
            }
            // If the user exists in the database already...
            else {
              let arrayLengthNum = results[0].messages.length;
              results[0].messages[arrayLengthNum] = { message: message.message };
              results[0].save();
            }
          });
      }
    }
    regex = /^(\/[A-z]+)/g;
    if (!regex.test(message.message)) {
      messageApp.emit('messageOut', message.message);
    }
  });

  // ================== Events for when user disconnects ==================
  socket.on('disconnect', () => {
    CL.remove(socket.id);
  });
});
