const http = require('http')
const path = require('path')

const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// custom requires
const { Message } = require('./utils/message')
const { Messages } = require('./utils/messages')
const { Users } = require('./utils/users')
const { User } = require('./utils/user')


const port = process.env.PORT || 3000
const publicDir = path.join(__dirname, '../public')

app.use(express.static(publicDir))

const users = new Users();
const messages = new Messages();

/*********************/

io.on('connection', (socket) => {
 
  let me;
  // Create new user
  socket.on('createNewUser', ({username}) => {
    me = users.addUser({username}, socket.id)
    emitUsersList(socket.id);



    const connectedUsers = users.getUser({username: me.username}).getConnectedUsers();

    connectedUsers.forEach((username) => {
      const u = users.getUser({username})
      emitUsersList(u.socketId, 'o')
    })
  })

  


  // Handle sending and receiving messages
  socket.on('newMessage', ({message, sentTo}, callback) => {
    const user = users.getUser({username: sentTo})
    if (user) {
      io.to(user.socketId).emit('receiveMessage', {
        message,
        from: me.username
      })
      messages.addMessage(new Message(message, me.username, sentTo))
      callback();
    }
  })

  socket.on('getMessages', (fromUsername, toUsername, callback) => {
    const msg = messages.getMessages(fromUsername, toUsername);

    if (msg)
      callback(msg)
  })

  socket.on('addUser', (username) => {
    const user = users.getUser({username})
    const m = users.getUser({username: me.username})
    
    if (user) {
      user.addNewUser(me.username)
      m.addNewUser(username)

      emitUsersList(user.socketId)
      emitUsersList(m.socketId)
    }
  })


  // function Sends the connected list and online list
  function emitUsersList (socketId, flag = 'both') {
    if (users.noOfUsers === 0)
      return;
    const user = users.getUser({socketId})
    if (!user)
      return;
    
    
    const connectedUsers = user.getConnectedUsers();

    

    if (flag === 'c') {
      io.to(socketId).emit('connectedUsers', connectedUsers)
      return;
    }
  

    const onlineUsers = users.getOnlineUsers()
  
    const list = connectedUsers.filter((username) => {
      let i = onlineUsers.findIndex((user) => user.username === username)
      if (i !== -1)
        return true
    })

    
    if (flag === 'o') {
      io.to(socketId).emit('onlineUsers', list)
      return;
    }

    io.to(socketId).emit('connectedUsers', connectedUsers)
    io.to(socketId).emit('onlineUsers', list)
    
  }

  socket.on('disconnect', () => {
    const user = users.getUser({socketId: socket.id})
    if (!user) { return }
    
    users.makeUserOffline(user.username)
    
    const connectedUsers = user.getConnectedUsers();

    connectedUsers.forEach((username) => {
      const u = users.getUser({username})
      emitUsersList(u.socketId, 'o')
    })
    
    console.log('disconnected', socket.id)
  })
})




/***FUnctions */




/**********************/

server.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})