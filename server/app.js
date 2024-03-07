const app = require('express')();
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const botName = "QuackBot";

app.get('/test', (req, res) => {
  res.send('<h1>Socket</h1>');
});

let activeUsers = [];

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('login', (user) => {
        activeUsers.push(user); // Lägg till användaren till listan över aktiva användare
        console.log(`${user} joined the server`);
        io.emit('userConnected', user); // Skicka användarens namn till alla anslutna klienter
      });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    let index = activeUsers.indexOf(socket.user);
    if (index !== -1) {
      let user = activeUsers.splice(index, 1)[0]; // Ta bort användaren från listan över aktiva användare
      console.log(`${user} left the server`);
      io.emit('userDisconnected', user); // Skicka användarens namn till alla anslutna klienter
    }
  });

  socket.emit(
    'chat',
    'Välkommen till chatten! Kom ihåg att alltid skriva snälla saker. :)', botName
  );

  socket.on('chat', (arg) => {
    console.log('incoming chat', arg);
    socket.broadcast.emit('chat', arg.message, arg.sender);
    console.log('FUNKAR DET HÄR', arg.sender);

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
