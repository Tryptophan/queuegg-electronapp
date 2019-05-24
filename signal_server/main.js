const io = require('socket.io')()

let rooms = new Set()

io.on('connection', client => {

  // Screen share app starts a room
  client.on('startRoom', () => {
    // Room url is generated using the date
    let room = client.id
    // Set with all the room ids
    rooms.add(room)
    // Send the generated url back to the electron app client
    client.emit('room', 'https://queue.gg/room/' + room)

    console.log('Rooms', rooms)

    // When the room starter disconnects delete the room
    client.on('disconnect', () => {
      rooms.delete(room)
      console.log('Rooms', rooms)
      // TODO: Tell other clients in the room to disconnect
    })
  })

  // Client wants to join a room
  // Payload: { room: ... }
  client.on('peer', (payload) => {
    console.log('Got peer', payload)
    // Get the screen sharer from the rooms map
    if (!rooms.has(payload.room)) {
      console.log('Room doesn\'t exist!')
      return
    }
    let sharer = payload.room

    // Tell the sharer a peer wants to join (this is so we can add the peer once to keep from modifying state many times on offers/answers)
    client.broadcast.to(sharer).emit('peer', { peer: client.id })
  })

  // Client is sending an offer to establish WebRTC connection
  // Offers are stateless, meaning it can happen many times, do not modify state in this callback
  // Payload: { offer: ..., room: ... }
  client.on('offer', (payload) => {
    // Get the screen share client from the rooms map
    let sharer = rooms.get(payload.room)
    console.log('Client wants to join room started client', sharer)

    // Send the offer to the screen sharer with the id of the client sending the offer
    client.broadcast.to(sharer).emit('offer', { offer: payload.offer, client: client.id })
  })

  // Screen share app wants to send an answer back to a client to finish WebRTC connection
  // Answers are stateless, meaning it can happen many times, do not modify state in this callback
  // Payload: { answer: ..., client: ... }
  client.on('answer', (payload) => {
    console.log('Got answer', payload)
  })
})

io.listen(3000)