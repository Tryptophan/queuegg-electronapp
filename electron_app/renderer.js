// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { desktopCapturer } = require('electron')
const io = require('socket.io-client')
const { EncodedStream } = require('mediastream-to-webm')

// MediaStream that contains screen share we want to send to the browser clients
let encodedStream = null

// Socket client TODO: configure to use queue.gg signalling server domain
const socket = io('http://206.189.182.118:3000')

// Array of sources to track selection
let previews = []

// Button listener to start screen sharing
document.getElementById('start-sharing').onclick = () => {

  previews = []
  document.getElementById('select-preview').disabled = true

  // Hide the screen share selection dialog and show the screen previews
  document.getElementById('selection').setAttribute('style', 'display: none')
  document.getElementById('previews').setAttribute('style', 'display: block')

  // Ask the user permission to share screen (returns MediaStream)
  desktopCapturer.getSources({ types: ['window', 'screen'] }).then(sources => {
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

const onData = (data) => {
  socket.emit('data', data)
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
        encodedStream = new EncodedStream(stream)
        encodedStream.on('data', onData)
      })
    }
  }
}

const clearPreviews = () => {
  // Remove the previews from their wrapper and the global state
  previews = []
  // Get list of all HTML elements with the preview class and remove them
  document.querySelectorAll('.preview').forEach(el => {
    el.remove()
  })
}

// User hit back button after opening previews
document.getElementById('back-button').onclick = () => {
  // Hide the previews element
  let previewsElement = document.getElementById('previews')
  previewsElement.setAttribute('style', 'display: none')
  clearPreviews()
  // Show the previous display again
  document.getElementById('selection').setAttribute('style', 'display: block')
}

// User canceled sharing after starting the room
document.getElementById('cancel-sharing').onclick = () => {
  // Hide the video element and remove the source object
  document.getElementById('video-wrapper').setAttribute('style', 'display: none')
  document.getElementById('video').srcObject = null
  // Clear previews like in the back button
  clearPreviews()
  // Return back to the home screen
  document.getElementById('selection').setAttribute('style', 'display: block')
  // Stop sending chunks to the relay server
  encodedStream.removeListener('data', onData)
  encodedStream = null
}

// Sent after we start a room, populate the shareable link with the url from the socket event
socket.on('room', (room) => {
  let link = document.getElementById('shareable-link')
  link.innerHTML = room
})