// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { desktopCapturer } = require('electron')
const io = require('socket.io-client')
const Peer = require('simple-peer')

// Socket client TODO: configure to use queue.gg signalling server domain
const socket = io('http://localhost:3000')

// Array of sources to track selection
let previews = []

// Map of peers to handle connections
let peers = new Map()

// Button listener to start screen sharing
document.getElementById('start-sharing').onclick = () => {

  previews = []
  document.getElementById('select-preview').disabled = true

  // Hide the screen share selection dialog and show the screen previews
  document.getElementById('selection').setAttribute('style', 'display: none')
  document.getElementById('previews').setAttribute('style', 'display: block')

  // Ask the user permission to share screen (returns MediaStream)
  desktopCapturer.getSources({ types: ['window', 'screen'] }).then(sources => {
    console.log(sources)
    // Map sources to preview panels
    // HTML will look something like this:
    // <div class="preview">
    //   <div class="thumbnail"></div>
    //   <span>Screen 1</span>
    // </div>
    let screens = document.getElementById('screens')
    let windows = document.getElementById('windows')
    for (const source of sources) {
      let preview
      // Separate out screen and window sources to their own divs
      if (source.id.includes('screen')) {
        preview = screens.appendChild(document.createElement('div'))
      } else {
        preview = windows.appendChild(document.createElement('div'))
      }
      // Add the preview image to the source
      preview.className = 'preview'
      let thumbnail = preview.appendChild(document.createElement('img'))
      thumbnail.src = source.thumbnail.toDataURL()
      thumbnail.id = source.id
      // Add the preview to a list to allow for single selection
      previews.push(thumbnail)
      preview.appendChild(document.createElement('span')).innerHTML = source.name
    }

    // Set listener for selecting a preview
    let thumbnails = document.querySelectorAll('.preview img')
    thumbnails.forEach(thumbnail => {
      thumbnail.onclick = (event) => {
        // Highlight the preview image using the selected class style
        for (const preview of previews) {
          preview.classList.remove('selected')
        }
        event.target.setAttribute('class', 'selected')

        // Set the select button to enabled
        document.getElementById('select-preview').disabled = false
      }
    })
  })
}

document.getElementById('select-preview').onclick = (event) => {
  // Check if the button is disabled (no preview selected), don't start screen sharing if so
  let select = event.target
  if (select.disabled) {
    return
  }

  // Get the resolution and fps constriants from the dropdowns
  let height = document.getElementById('resolution').value
  let fps = document.getElementById('fps').value

  // Loop through the array of previews and check for the preview selected
  for (const preview of previews) {
    if (preview.classList.contains('selected')) {
      // Get the media stream for the preview (screen or window)
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: preview.id,
            minHeight: height,
            maxHeight: height,
            minFrameRate: fps,
            maxFrameRate: fps
          }
        }
      }).then(stream => {
        // Hide the previews dialog
        document.getElementById('previews').setAttribute('style', 'display: none')
        // Pass the stream from the preview to the video object
        let video = document.getElementById('video')
        video.srcObject = stream
        document.getElementById('video-wrapper').setAttribute('style', 'display: block')
        // Tell socket server room has been started
        socket.emit('startRoom')
        // TODO: Open WebRTC connections
      })
    }
  }
}

// Sent after we start a room, populate the shareable link with the url from the socket event
socket.on('room', (room) => {
  let link = document.getElementById('shareable-link')
  link.innerHTML = room
})

// Peer wants to join the room, create a peer object to later connect to them
socket.on('peer', (payload) => {
  console.log('Peer wants to join', payload)
  let id = payload.peer
  // Add the peer to the peer map for the room
  let peer = new Peer({
    // Peer is not the initiator, since the other clients are the ones first connecting to watch the screen share
    initiator: false,
    // This is where a turn server would be configured (preferably with creds pulled from an environment file or server so only people with the app or on the site can use it)
    // There is probably a way to link queue.gg accounts to authenticate a turn server
    // config: {
    //   iceServers: [
    //     {
    //       urls: 'https://turn.queue.gg',
    //       username: turnUsername,
    //       credential: turnPassword
    //     }
    //   ]
    // }
  })

  // Set up callback to signal the answer to the peer when we get the offer
  peer.on('signal', (answer) => {
    socket.emit('answer', { answer: answer, client: id })
  })

  // Add the peer to the peers map to later use when signalling offers
  peers.set(id, peer)
})

// Received an offer from another client that wants to join the room
// Payload: { offer: ..., client: id }
socket.on('offer', (payload) => {
  // Generate a peer with an answer to send back to the other client
  console.log('Got offer', payload)
})