'use strict';

const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const messageSchema = new Schema({
  message: { type: String }
});

const userSchema = new Schema({
  name: { type: String, required: true },
  messages: [messageSchema]
});

const UserModel = model('Users', userSchema);
module.exports = UserModel;
