const app = require('express')();
const server = require('http').createServer(app);
const mongoose = require('mongoose');
const cors = require('cors');
const PORT = 3032;

app.use(cors());

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const { userJoin, currentUser, userLeave } = require('./users.js');

/* app.get('/test', (req, res) => {
  res.send('<h1>Socket</h1>');
}); */

const botName = 'QuackBot';
let playersList = [];

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('login', ({ username, color }) => {
    playersList.push({ username, id: socket.id, color });
    console.log(playersList, 'player list, app');
    console.log(`${username} joined the server`);
    io.emit('usersConnected', playersList);

    const user = userJoin(socket.id, username, color);
    socket.join(user);
    console.log('user', user);
  });

  socket.on('disconnect', () => {
    const disconnectedUser = playersList.find((user) => user.id === socket.id);

    if (disconnectedUser) {
      playersList = playersList.filter((user) => user.id !== socket.id);
      console.log(`${disconnectedUser.username} left the server`);
      io.emit('userDisconnected', disconnectedUser);
      io.emit('usersConnected', playersList);
    }
  });

  socket.emit(
    'chat',
    'Välkommen till chatten! Kom ihåg att alltid skriva snälla saker. :)',
    botName
  );

  socket.on('chat', async (arg) => {
    console.log('incoming chat', arg);

    try {
      const newMessage = new Message({
        content: arg.message,
        userName: arg.sender,
        userColor: arg.color,
      });

      await newMessage.save();
      console.log('Message saved to the database:', newMessage);
      // io.emit('chat', arg);

      socket.broadcast.emit('chat', arg.message, arg.sender, arg.color);
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  });
});

server.listen(process.env.PORT || '3032');
