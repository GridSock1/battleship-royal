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


const botName = "QuackBot";

const Message = require('../database/models/messageModel.js');

mongoose
  .connect(
    'mongodb+srv://jarileminaho:PMc7xtzaX4yXKJM1@cluster0.rf4p1sc.mongodb.net/battleship_test_server?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(() => {
    console.log('Connected to MongoDB from server');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


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

  socket.on('chat', async (arg) => {
    console.log('incoming chat', arg);

    socket.broadcast.emit('chat', arg.message, arg.sender, arg.color);


    try {
      const newMessage = new Message({
        content: arg.message,
      });

      await newMessage.save();
      console.log('Message saved to the database:', newMessage);
      io.emit('chat', arg);

      socket.broadcast.emit('chat', arg.message, arg.sender);
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
