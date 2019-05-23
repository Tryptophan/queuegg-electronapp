const io = require('socket.io')()

let rooms = new Set()

io.on('connection', client => {

  client.on('startRoom', () => {
    let room = 'https://queue.gg/room/' + Date.now()
    rooms.add(room)
    client.emit('room', room)

    client.on('disconnect', () => {
      rooms.delete(room)
    })
  })
})

io.listen(3000)