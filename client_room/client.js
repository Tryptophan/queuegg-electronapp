const io = require('socket.io-client')
const Peer = require('simple-peer')

// Get the room id from the url parameters
const pathname = window.location.pathname
const room = pathname.substring(pathname.lastIndexOf('/') + 1)

// Connect to the socket signalling server to establish peer connections
const socket = io('http://localhost:3000')
socket.on('connect', () => {
  // Send the message to join the room
  socket.emit('peer', { room: room })
})

// Create our peer immediately, since we expect that the room will have been started
const peer = new Peer({
  initiator: true,
  // Similar to the peer configuration in the electron app, this sets up a connection to a turn server using credentials. See the file /electron_app/renderer.js for a more thorough explaination
  // config: {
  //   iceServers: [
  //     {
  //       urls: https://turn.queue.gg,
  //       username: turnUsername,
  //       credential: turnPassword
  //     }
  //   ]
  // }
})

// Send offer to the socket server once the peer is instantiated to tell the electron app we want to establish a WebRTC p2p connection
peer.on('signal', (offer) => {
  socket.emit('offer', { offer: offer, room: room })
})

// Check for answers back from the electron app
socket.on('answer', (payload) => {
  console.log('Got answer', payload)
  peer.signal(payload.answer)
})

peer.on('stream', (stream) => {
  console.log(stream)
  document.getElementById('video').srcObject = stream
})
