const app = require('express')(); // Import express and create instance
const http = require('http').Server(app); // Create Instance of http server
const port = 8080; // Port to use for server
const io = require('socket.io')(http);
var cors = require('cors')
app.use(cors())

// Return HI to localhost:8080
app.get('/', (req, res) => res.send('HI'))

// Dictionary of connected users
const users = {};
const idToUser = {};

// Available Rooms
const rooms = ['LOBBY'];

// Called when someone opens a socketconenction with out server
io.on('connection', (socket) => {
  socket.emit('connected');

  socket.on('login', username => {
    if(!users[username]) {
      newUserData = {};
      newUserData['id'] = socket.id;
      newUserData['curRoom'] = 'LOBBY';
      users[username] = newUserData;
      idToUser[socket.id] = username;

      socket.emit('ROOMS', {rooms});
      socket.join('LOBBY');
      socket.emit('JOINED', 'LOBBY');
    } else {
      socket.emit('userTaken');
    }
  });

  socket.on('changeRoom', room => {
    let curUser = users[idToUser[socket.id]];
    socket.leave(curUser['curRoom']);
    socket.join(room);
    curUser['curRoom'] = room;

    if (!rooms.includes(room)) {
      rooms.push(room);
    }

    io.emit('ROOMS', {rooms});
  });

  socket.on('message', msg => {
    let curUser = users[idToUser[socket.id]];
    socket.broadcast.to(curUser['curRoom']).emit('message', msg);
  })

  socket.on('logout', () => {
    delete users[idToUser[socket.id]]
    delete idToUser[socket.id]
    socket.disconnect();
  })
});

// Server starts listening
http.listen(port, () => console.log(`App Online`))
