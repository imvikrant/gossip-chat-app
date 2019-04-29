const { User } = require('./user')

function Users() {
  this.users = []
}

Users.prototype.noOfUsers = function() {
  return this.users.length;
}

Users.prototype.getUser = function({socketId, username}) {
  if (socketId)
    return this.users.find(user => user.socketId === socketId)

  if (username)
    return this.users.find(user => user.username === username)
}

Users.prototype.addUser = function({username}, socketId) {
  let i = this.users.findIndex(user => user.username === username) 
  
  me = new User(username, socketId)

  if (i === -1)
    this.users.push(me)
  else {
    this.users[i].socketId = socketId
  }
  return me;
}

Users.prototype.getOnlineUsers = function() {
  if (this.users)
    return this.users.filter(user => user.socketId !== null)
}

Users.prototype.makeUserOffline = function(username) {
  const index = this.users.findIndex(user => user.username === username)

  if (index !== -1)
    this.users[index].removeSocketId()
}

module.exports = {
  Users
}