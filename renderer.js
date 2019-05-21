// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer, desktopCapturer } = require('electron');

// Button listener to start screen sharing
document.getElementById('start-sharing').addEventListener('click', () => {

  // Hide the screen share selection dialog and show the screen previews
  document.getElementById('selection').setAttribute('style', 'display: none')
  document.getElementById('previews').setAttribute('style', 'display: block')

  // Ask the user permission to share screen (returns MediaStream)
  desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
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
      let preview;
      if (source.id.includes('screen')) {
        preview = screens.appendChild(document.createElement('div'))
      } else {
        preview = windows.appendChild(document.createElement('div'))
      }
      preview.className = 'preview'
      preview.appendChild(document.createElement('img')).src = source.thumbnail.toDataURL()
      preview.appendChild(document.createElement('span')).innerHTML = source.name
    }

    // for (const source of sources) {
    // Render sources in dialog

    // await navigator.mediaDevices.getUserMedia({
    //   audio: false,
    //   video: {
    //     mandatory: {
    //       chromeMediaSource: 'desktop',
    //       chromeMediaSourceId: source.id,
    //       minWidth: 1280,
    //       maxWidth: 1280,
    //       minHeight: 720,
    //       maxHeight: 720
    //     }
    //   }
    // })
    // }
  })
})