const app = require('express')();
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const {
    userJoin, 
    currentUser, 
    userLeave
} = require('./users.js'); 

/* app.get('/test', (req, res) => {
  res.send('<h1>Socket</h1>');
}); */


const botName = "QuackBot";
let playersList = [];
// --- user color ---
let availableColors = ['#08ff4a', '#ff08de', '#ff8308', '#ff0077', '#ededed', '#b300ff', '#84ab35', '#b07f6d', '#c406d1', '#adadad'];
let assignedColors = [];

function generateColor() {   
    let randomColorIndex = Math.floor(Math.random() * availableColors.length);
    const color = availableColors[randomColorIndex];
    assignedColors.push(color); 
    availableColors.splice(randomColorIndex, 1); 
    return color; // Returnera färgen för att användas av spelaren
}

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('login', ({ username }) => {
        const color = generateColor(); // Generera en färg för användaren
        playersList.push({ username, id: socket.id, color }); 
        console.log(playersList, 'player list, app');
        console.log(`${username} joined the server`);
        io.emit('usersConnected', playersList); 

        socket.emit('username', username);
        
        const user = userJoin(socket.id, username, color);
        socket.join(user); 
        console.log('user', user);

        console.log(assignedColors, 'assignedColors app');
    });

    socket.on('disconnect', () => {
        const disconnectedUser = playersList.find(user => user.id === socket.id);
        
        if (disconnectedUser) {
            availableColors.push(disconnectedUser.color);
            const index = assignedColors.indexOf(disconnectedUser.color);
            if (index !== -1) {
                assignedColors.splice(index, 1);
            }
            
            playersList = playersList.filter(user => user.id !== socket.id);
            console.log(`${disconnectedUser.username} left the server`);
            io.emit('userDisconnected', disconnectedUser); 
            io.emit('usersConnected', playersList); 
        }
    });

  socket.emit(
    'chat',
    'Välkommen till chatten! Kom ihåg att alltid skriva snälla saker. :)', botName
  );

  socket.on('chat', (arg) => {
    console.log('incoming chat', arg);
    socket.broadcast.emit('chat', arg.message, arg.sender, arg.color);

    socket.on('colorChange', (changeData) => {
        io.emit('colorChanged', changeData);
      });

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
