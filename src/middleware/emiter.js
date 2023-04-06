/* eslint-disable quotes */
// eslint-disable-next-line quotes
const EventEmitter = require("events");
// eslint-disable-next-line quotes
const logEvents = require("./logEvents");

class Emitter extends EventEmitter {}

const myEmitter = new Emitter();
myEmitter.on("log", (msg, filename) => logEvents(msg, filename));

module.exports = { Emitter, myEmitter };
