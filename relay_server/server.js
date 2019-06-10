const io = require('socket.io')()

let rooms = new Map()

io.on('connection', client => {

  // Screen share app starts a room
  client.on('startRoom', () => {
    console.log('Electron app wants to start a room.')
    // Room url is generated using the date
    let room = client.id
    // Set with all the room ids
    rooms.set(room, [])
    // Send the generated url back to the electron app client
    client.emit('room', 'https://queue.gg/room/' + room)

    console.log('Rooms', rooms)

    // When the room starter disconnects delete the room
    client.on('disconnect', () => {
      rooms.delete(room)
      console.log('Rooms', rooms)
    })
  })

  // TODO: Client joined a room
  client.on('join', (payload) => {

    let room = rooms.get(payload.room)

    if (!room) {
      return
    }

    // Add the new client to the room
    room.push(client.id)

    // Add the room with the new client to the rooms map
    rooms.set(payload.room, room)

    // Remove the client from the room when they disconnect
    client.on('disconnect', () => {
      room.splice(room.indexOf(client.id), 1)
      rooms.set(id, room)
    })
  })

  // Sharer sent data (relay to all clients in the room)
  client.on('data', (data) => {
    let room = rooms.get(client.id)

    if (!room) {
      return
    }

    room.forEach(id => {
      client.broadcast.to(id).emit('data', data)
    })
  })
})

io.listen(3000)