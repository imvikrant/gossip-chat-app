const socket = io();

const $chatBox = document.getElementById('chat-box')
const $chatArea = document.querySelector('.chat-area')
const $searchBox = document.querySelector('#search-box')
const $sendMessageButton = document.querySelector('#send-message-btn')
const $usersList = document.querySelector('.users-list')
const $userDisplayName = document.querySelector('.user-display-name')
const $myDisplayName = document.querySelector('.my-display-name')

let currentUser = null;

const messageTemplate = document.getElementById('message-template').innerHTML
const usersListTemplate = document.getElementById('users-list-template').innerHTML

const { username } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const myUsername = username;

let list = []


// Create a new user
socket.emit('createNewUser', {username});

$myDisplayName.textContent = myUsername;

// Update chat area on message sent
$sendMessageButton.addEventListener('click', (e) => {
  e.preventDefault();
  const message = $chatBox.value;
  $chatBox.value = "";

  socket.emit('newMessage', {
    message,
    sentTo: currentUser
  }, () => renderMessage(message))
})

// Update chat area on message received
socket.on('receiveMessage', ({message, from}) => {
  if (from === currentUser)
    renderMessage(message, from)
  else 
    notifyNewMessage(from)
})


function notifyNewMessage(to) {
  $lis = document.querySelectorAll('.users-list li')

  $lis.forEach((li) => {
    if (li.children[1].textContent === to)
      li.children[1].classList.add('new-message')
  })
}


socket.on('onlineUsers', (onlineList) => {

  list.forEach(l => {
    if (onlineList.includes(l.username))
      l.online = true;
    else
      l.online = false;
  })

  renderUsersList();
})

socket.on('connectedUsers', (connectedList) => {
  list = [];
  connectedList.forEach(username => list.push({
    username,
    online: false
  }))
  currentUser = null;
  renderUsersList();
})

// Change current chat to another user
$searchBox.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    e.preventDefault()
    
    socket.emit('addUser', e.target.value)
    e.target.value = ''
  }
})


// Utility functions
const renderMessage = (message, username = '') => {

  const alignment = username || 'align-right'

  const html = Mustache.render(messageTemplate, {
    message,
    alignment,
    username
  })

  $chatArea.insertAdjacentHTML('beforeend', html)
}

//render the list

const renderUserList = (username, online) => {
  const html = Mustache.render(usersListTemplate, {
    username,
    online
  })

  $usersList.insertAdjacentHTML('beforeend', html)
}

const renderUsersList = () => {
  if (!list) {
    return
  }

  $usersList.innerHTML = ''
  list.forEach(l => {
    if (l.online)
      renderUserList(l.username, 'online')
    else
      renderUserList(l.username)
  })
}

// highligh the current user of chat
$usersList.addEventListener('click', (e) => {

  $lis = document.querySelectorAll('.users-list li')
  $lis.forEach(li => li.classList.remove('selected'))

  const li = e.target.closest('li'); 

  currentUser = li.children[1].textContent


  li.classList.add('selected')
  li.children[1].classList.remove('new-message')
  

  socket.emit('getMessages', myUsername, currentUser ,(msg) => {
    updateChatWindow(msg, currentUser)
  })

})

const updateChatWindow = (messages, username) => {
  console.log('updateing...')
  console.log(messages)
  $userDisplayName.textContent = username
  $chatArea.innerHTML = ""
  messages.forEach((msg) => {
    if (msg.fromUser === myUsername)
      renderMessage(msg.message)
    else 
      renderMessage(msg.message, username)
  })
}