const app = require('express')();
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.get('/test', (req, res) => {
  res.send('<h1>Socket</h1>');
});

io.on('connection', (socket) => {
  socket.emit(
    'chat',
    'Välkommen till chatten! Kom ihåg att alltid skriva snälla saker. :)'
  );

  socket.on('chat', (arg) => {
    console.log('incoming chat', arg);
    socket.broadcast.emit('chat', arg.message, arg.sender, 'recieved');
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

server.listen(process.env.PORT || '8080');
