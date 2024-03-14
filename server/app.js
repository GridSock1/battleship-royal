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
const { createAndPlaceShips } = require('./game-test.js');

const Message = require('./models/messageModel.js');

mongoose
  .connect(
    'mongodb+srv://jarileminaho:PMc7xtzaX4yXKJM1@cluster0.rf4p1sc.mongodb.net/battleship_live?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(() => {
    console.log('Connected to MongoDB from server');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

/* app.get('/test', (req, res) => {
  res.send('<h1>Socket</h1>');
}); */

const botName = 'QuackBot';
let playersList = [];

// --- user color ---
let availableColors = [
  '#08ff4a',
  '#ff08de',
  '#ff8308',
  '#ff0077',
  '#00e5ff',
  '#b300ff',
  '#84ab35',
  '#b07f6d',
  '#c406d1',
  '#adadad',
];
let assignedColors = [];

// --- battle ships ---
let userShips = [];
let userSquares = [];

const width = 40;
const shipsArray = [
  {
    name: 'rowboat',
    directions: [
      [0, 1],
      [0, width],
    ],
  },
  {
    name: 'sailboat',
    directions: [
      [0, 1, 2],
      [0, width, width * 2],
    ],
  },
  {
    name: 'fishingboat',
    directions: [
      [0, 1, 2, 3],
      [0, width, width * 2, width * 3],
    ],
  },
  {
    name: 'pirateship',
    directions: [
      [0, 1, 2, 3, 4],
      [0, width, width * 2, width * 3, width * 4],
    ],
  },
];

// function createAndPlaceShips(user){
//   const shipPositions = [];
//   shipsArray.forEach(ship => {
//     let isValidPlacement = false;
//     const shipPosition = {
//       name: ship.name,
//       positions: []
//     }
//     while (!isValidPlacement) {
//       const randomDirectionIndex = Math.floor(Math.random() * ship.directions.length);
//       const randomDirection = ship.directions[randomDirectionIndex];
//       const randomStartIndex = Math.floor(Math.random() * width * width);
//       const startX = randomStartIndex % width;
//       const startY = Math.floor(randomStartIndex / width);
//       isValidPlacement = true;
//       for (let i = 0; i < randomDirection.length; i++) {
//         const nextX = startX + randomDirection[i] % width;
//         const nextY = startY + Math.floor(randomDirection[i] / width);
//         if (nextX >= width || nextY >= width || userSquares[nextX + nextY * width].classList.contains('taken')) {
//           isValidPlacement = false;
//           break;
//         }
//         shipPosition.positions.push([nextX, nextY])
//       }
//       if (isValidPlacement) {
//         for (let i = 0; i < randomDirection.length; i++) {
//           const nextX = startX + randomDirection[i] % width;
//           const nextY = startY + Math.floor(randomDirection[i] / width);
//           const square = userSquares[nextX + nextY * width];
//           square.classList.add('taken');
//           userSquares[nextX + nextY * width].dataset.ship = ship.name;
//           square.style.backgroundColor = user.color; // Tilldela färgen till skeppet om man lyckas exportera på nå vis
//         }
//       }
//     }
//     shipPositions.push(shipPosition)
//   });
//   console.log('Array with ships',shipPositions)

//   user.shipPositions = shipPositions;
//   return shipPositions;
//   // socket.emit('placeShipPositions', {playerId: socket.id, shipPositions})
// }

// createAndPlaceShips();
// --- color ---
function generateColor() {
  let randomColorIndex = Math.floor(Math.random() * availableColors.length);
  const color = availableColors[randomColorIndex];
  assignedColors.push(color);
  availableColors.splice(randomColorIndex, 1);
  return color;
}

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('login', ({ username }) => {
    const color = generateColor(); // Generera en färg för användaren

    /* const userShips = [
            {
              name: 'rowboat',
              directions: [
                [0, 1],
                [0, width],
              ],
            },
            {
              name: 'sailboat',
              directions: [
                [0, 1, 2],
                [0, width, width * 2],
              ],
            },
            {
              name: 'fishingboat',
              directions: [
                [0, 1, 2, 3],
                [0, width, width * 2, width * 3],
              ],
            },
            {
              name: 'pirateship',
              directions: [
                [0, 1, 2, 3, 4],
                [0, width, width * 2, width * 3, width * 4],
              ],
            },  
          ]; */

    playersList.push({ username, id: socket.id, color });
    // console.log(playersList, 'player list, app');
    // console.log(`${username} joined the server`);
    //console.log(ships, 'ships')

    io.emit('usersConnected', playersList);
    socket.emit('username', username);
    socket.emit('color', color);

    const user = userJoin(socket.id, username, color);
    socket.join(user.id);

    // createAndPlaceShips(user);
    const shipPositions = createAndPlaceShips(userSquares);
    user.addShipPositions(shipPositions);
    console.log('user, app: line 196', user);

    socket.emit('playerSetup', {
      ships: user.shipPositions,
      color: user.color,
      source: 'server',
    });

    console.log('Ship positions:', JSON.stringify(user.shipPositions, null, 2));

    console.log(assignedColors, 'assignedColors app');
  });

  socket.on('placeShipPositions', (positions) => {
    const { playerId, position } = positions;

    if (position && Array.isArray(position)) {
      console.log('Placerade båtar för spelarID:');
      position.forEach((ship, index) => {
        console.log(`Båt ${index + 1} position:`, ship.positions);
      });
    }

    io.emit('updateShipPositions', { playerId, position });
  });

  socket.on('disconnect', () => {
    const disconnectedUser = playersList.find((user) => user.id === socket.id);

    if (disconnectedUser) {
      availableColors.push(disconnectedUser.color);
      const index = assignedColors.indexOf(disconnectedUser.color);
      if (index !== -1) {
        assignedColors.splice(index, 1);
      }

      playersList = playersList.filter((user) => user.id !== socket.id);
      console.log(`${disconnectedUser.username} left the server`);
      io.emit('userDisconnected', disconnectedUser);
      io.emit('usersConnected', playersList);
    }
  });

  socket.on('shoot', ({ position, color }) => {
    const colorData = { position, color };
    console.log(colorData, 'colordata app js');
    io.emit('colorChanged', colorData);
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
