// NOTE: This code is only required for testing, index.html is the only real important file in the client_room app
// This express server is to just emulate the route eg. https://queue.gg/room/1234
const express = require('express')
const path = require('path')
const app = express()
const port = 8080

// IMPORTANT: The route for the webpage displaying the room may need to have CORS enabled as the socket signalling server may be hosted on another origin/domain
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// Serve javascript bunlde to run node.js packages in browser
app.get('/bundle', (req, res) => {
  res.contentType = 'text/javascript'
  res.sendFile(path.join(__dirname, 'bundle.js'))
})

app.use('/public', express.static(__dirname + '/static'))
// Express route to handle room url
app.get('/room/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(port, () => {
  console.log('Test server to serve client page listening on port 8080.')
})