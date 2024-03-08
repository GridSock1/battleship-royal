const app = require('express')();
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

/* app.get('/test', (req, res) => {
  res.send('<h1>Socket</h1>');
}); */


const botName = "QuackBot";
let playersList = [];


io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('login', (user) => {
        playersList.push(user); 
        console.log(playersList, 'player list, app');
        console.log(`${user} joined the server`);
        io.emit('usersConnected', playersList); 
      });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    let index = playersList.indexOf(socket.user);
    if (index !== -1) {
      let user = playersList.splice(index, 1)[0]; 
      console.log(`${user} left the server`);
      io.emit('userDisconnected', user); 
    }
  });

  socket.emit(
    'chat',
    'Välkommen till chatten! Kom ihåg att alltid skriva snälla saker. :)', botName
  );

  socket.on('chat', (arg) => {
    console.log('incoming chat', arg);
    socket.broadcast.emit('chat', arg.message, arg.sender, arg.color);

    /* try {
      const newMessage = new Message({ content: arg.message });

      await newMessage.save();
      io.emit('chat', arg);
      socket.broadcast.emit('chat', arg);
    } catch (error) {
      console.error('Error saving message:', error);
    } */
  });
});

server.listen(process.env.PORT || '3031');
