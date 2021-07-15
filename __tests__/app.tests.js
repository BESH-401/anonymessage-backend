'use strict';

const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");

describe("AnonyMessage backend app tests", () => {
  let io, serverSocket, clientSocket;

  beforeEach((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  afterEach(() => {
    io.close();
    clientSocket.close();
  });

  test("Initial login found on server", (done) => {
    clientSocket.emit("initialLogin", "Susan");
    serverSocket.on("initialLogin", (arg) => {
      expect(arg).toBe("Susan");
      done();
    });
  });

  test("Testing message out from client to server", (done) => {
    clientSocket.emit("message", { username: "name", message: "Normal message" });
    serverSocket.on("message", (arg) => {
      expect(arg.message).toBe("Normal message");
      expect(arg.username).toBe("name");
      done();
    });
  });

  test("Testing message from server to client", (done) => {
    serverSocket.emit("messageOut", { username: "name", message: "Default" })
    clientSocket.on("messageOut", (arg) => {
      expect(arg.message).toBe("Default");
      done();
    });
  });

  test("Testing `/help` command", (done) => {
    clientSocket.emit("message", { username: "name", message: "/help" });
    serverSocket.on("message", (arg) => {
      expect(arg.message).toBe("/help");
      done();
    });
    serverSocket.emit("messageOut", "To send a message to a specific person, use `@name` at the beginning of your message, and if the user is offline, will send the message to them when they come online. For a full list of commands, use: `/commands`.");
    clientSocket.on("messageOut", (arg) => {
      expect(arg).toBe("To send a message to a specific person, use `@name` at the beginning of your message, and if the user is offline, will send the message to them when they come online. For a full list of commands, use: `/commands`.");
      done();
    });
  });

  test("Testing `/commands` command", (done) => {
    clientSocket.emit("message", { username: "name", message: "/commands" });
    serverSocket.on("message", (arg) => {
      expect(arg.message).toBe("/commands");
      done();
    });
    serverSocket.emit("messageOut", "`/help` - Will inform the user of mentioning feature. `/people` - Will display a list of current aliases connected to the server. `/commands` - Will display a list of availiable commands'");
    clientSocket.on("messageOut", (arg) => {
      expect(arg).toBe("`/help` - Will inform the user of mentioning feature. `/people` - Will display a list of current aliases connected to the server. `/commands` - Will display a list of availiable commands'");
    });
  });

  test("Testing `/people` command", (done) => {
    clientSocket.emit("message", { username: "name", message: "/people" });
    serverSocket.on("message", (arg) => {
      expect(arg.message).toBe("/people");
      done();
    });
    serverSocket.emit("messageOut", "Clients connnected to server: name");
    clientSocket.on("messageOut", (arg) => {
      expect(arg).toBe("Clients connnected to server: name");
    });
  });

  test("Message mentioning other user that is offline enters database", (done) => {
    clientSocket.emit("message", { username: "name", message: "@otherName message" });
    serverSocket.on("message", (arg) => {
      let regex = /^(@[A-Za-z]+)/g;
      let temp = arg.message.split(' ')[0];
      temp = temp.split('');
      temp = temp.splice(1, temp.length, '');
      temp = temp.join('');
      expect(regex.test(arg.message) && arg.username !== temp).toBe(true);
      done();
    });
  });

  test("Message mentioning other user that is online remains off database", (done) => {
    clientSocket.emit("message", { username: "name", message: "@name message" });
    serverSocket.on("message", (arg) => {
      let regex = /^(@[A-Za-z]+)/g;
      let temp = arg.message.split(' ')[0];
      temp = temp.split('');
      temp = temp.splice(1, temp.length, '');
      temp = temp.join('');
      expect(regex.test(arg.message) && arg.username !== temp).toBe(false);
      done();
    });
  });
});