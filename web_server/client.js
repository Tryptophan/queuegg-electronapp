const io = require('socket.io-client')
const { DecodedStream } = require('mediastream-to-webm')

let decodedStream = DecodedStream({ videoElement: document.getElementById('video') });

// Get the room id from the url parameters
const pathname = window.location.pathname
const room = pathname.substring(pathname.lastIndexOf('/') + 1)

// Connect to the socket signalling server to establish peer connections
// TODO: Configure to use queuegg signalling server
const socket = io('http://206.189.182.118:3000')
socket.on('connect', () => {
  // Send the message to join the room
  socket.emit('join', { room: room })
})

socket.on('data', (data) => {
  decodedStream.write(new Uint8Array(data))
})
