// NOTE: This code is only required for testing, index.html is the only real important file in the client_room app
// This express server is to just emulate the route eg. https://queue.gg/room/1234
const express = require('express')
const path = require('path')
const app = express()
const port = 8080

// IMPORTANT: The route for the webpage displaying the room may need t have CORS enabled as the socket signalling server may be hosted on another origin/domain
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// Express route to handle room url
app.get(['/', '/*'], (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'))
})

app.listen(port, () => {
  console.log('Test server to serve client page listening on port 8080.')
})