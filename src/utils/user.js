function User(username, socketId) {
  this.username = username
  this.socketId = socketId
  this.connectedUsersList = []
}

User.prototype.removeSocketId = function() {
  this.socketId = null;
}

User.prototype.addNewUser = function(username) {
  this.connectedUsersList.push(username)
}

User.prototype.getConnectedUsers = function() {
  return this.connectedUsersList.slice()
}

module.exports = {
  User
}