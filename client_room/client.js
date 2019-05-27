console.log('test')

const io = require('socket.io-client')

// Connect to the socket signalling server to establish peer connections
const socket = io('http://localhost:3000')
socket.on('connect', () => {
  // Get the room id from the url parameters
  let pathname = window.location.pathname
  let room = pathname.substring(pathname.lastIndexOf('/') + 1)

  // Send the message to join the room
  socket.emit('peer', { room: room })
})
