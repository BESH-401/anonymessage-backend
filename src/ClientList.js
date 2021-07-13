'use strict';

class Client {
  constructor(username, sID) {
    this.name = username;
    this.socketID = sID;
  }
}

class ClientList {
  constructor() {
    this.clientList = [];
  }

  add(username, sID) {
    let newClient = new Client(username, sID)
    this.clientList.push(newClient);
  }

  remove(sID) {
    let current = 0;
    let sIDMatch = false;
    while (current < this.clientList.length && sIDMatch === false) {
      if (this.clientList[current].socketID === sID) {
        this.clientList.splice(current, 1);
        sIDMatch = true;
      }
      current++;
    }
  }
}

module.exports = ClientList;
