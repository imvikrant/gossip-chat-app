const { Message } = require('./message');

const Messages = function() {
  this.messages = {};
}

Messages.prototype.addMessage = function (message) {

  const fromUsername = message.fromUser;
  const toUsername = message.toUser;
  
  let searchString;

  if (fromUsername < toUsername)
    searchString = `${fromUsername}-${toUsername}`
  else
    searchString = `${toUsername}-${fromUsername}`

  if(!this.messages.hasOwnProperty(searchString)) {
    this.messages[searchString] = {messages: []}
  }

  this.messages[searchString].messages.push(message)
  
}

Messages.prototype.getMessages = function(fromUsername, toUsername) {

  let searchString
  if (fromUsername < toUsername)
    searchString = `${fromUsername}-${toUsername}`
  else
    searchString = `${toUsername}-${fromUsername}`

  if(this.messages.hasOwnProperty(searchString)) {
    return this.messages[searchString].messages
  }
}

module.exports = {
  Messages
}