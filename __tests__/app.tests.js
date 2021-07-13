'use strict';

const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");

describe("AnonyMessage backend app tests", () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
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

  afterAll(() => {
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
    clientSocket.emit("message", "Normal message");
    serverSocket.on("message", (arg) => {
      expect(arg).toBe("Normal message");
      done();
    });
  });

  test("Testing message from server to client", (done) => {
    serverSocket.emit("messageOut", "Default")
    clientSocket.on("messageOut", (arg) => {
      expect(arg).toBe("Default");
      done();
    });
  });

  // test("Testing `/help` command", (done) => {
  //   clientSocket.emit("message", "/help");
  //   serverSocket.on("message", (arg) => {
  //     expect(arg).toBe("/help");
  //     done();
  //   });
  //   clientSocket.on("messageOut", (arg) => {
  //     expect(arg).toBe("To send a message to a specific person, use `@name` at the beginning of your message, and if the user is offline, will send the message to them when they come online. For a full list of commands, use: `/commands`.");
  //     done();
  //   });
  // });

  // test("Testing `/commands` command", (done) => {
  //   clientSocket.emit("message", "Normal message");
  //   serverSocket.on("message", (arg) => {
  //     expect(arg).toBe("Normal message");
  //     done();
  //   });
  // });

  // test("Testing `/people` command", (done) => {
  //   clientSocket.emit("message", "Normal message");
  //   serverSocket.on("message", (arg) => {
  //     expect(arg).toBe("Normal message");
  //     done();
  //   });
  // });
});