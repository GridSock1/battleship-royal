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

const botName = 'QuackBot';
let playersList = [];
const playerPoints = {};

// --- user color ---
let availableColors = [
  '#08ff4a',
  '#ff08de',
  '#ff8308',
  '#ff0077',
  '#00e5ff',
  '#b360ff',
  '#84ab35',
  '#b07f6d',
  '#c446d1',
  '#adadad',
];
let assignedColors = [];

// --- battle ships ---
//let userShips = [];
let userSquares = [];

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

  //players[socket.id] = { ready: false };

  socket.on('login', ({ username }) => {
    const color = generateColor();

    const user = userJoin(socket.id, username, color);
    playerPoints[user.name] = 0;
    socket.join(user.id);
    console.log('username', user.name);

    // createAndPlaceShips(user);
    const shipPositions = createAndPlaceShips(userSquares);
    user.addShipPositions(shipPositions);
    console.log('user, app: line 196', user);

    socket.emit('playerSetup', {
      username: user.name,
      ships: user.shipPositions,
      color: user.color,
      source: 'server',
    });

    playersList.push(user);
    io.emit('usersConnected', playersList);
    socket.emit('username', username);
    socket.emit('color', color);

    console.log('Players list', playersList);
  });

  socket.on('readyButtonClicked', () => {
    console.log('Player is ready:', socket.id);
    players[socket.id].ready = true;

    if (checkAllPlayersReady()) {
      startGame();
    }
  });

  function checkAllPlayersReady() {
    for (const playerId in players) {
      if (!players[playerId].ready) {
        return false;
      }
    }
    return true;
  }

  function startGame() {
    console.log('Spelet startar...');

    for (const player of allPlayerShips) {
      const shipPositions = createAndPlaceShips();

      io.to(player.id).emit('placeShips', { playerId, shipPositions });
    }
  }

  socket.on('placeShipPositions', (positions) => {
    const { playerId, position } = positions;

    if (position && Array.isArray(position)) {
      // console.log('Placerade båtar för spelarID:');
      position.forEach((ship, index) => {
        // console.log(`Båt ${index + 1} position:`, ship.positions);
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

  const clickedSquares = new Set();
  let playersLost = [];

  socket.on('shoot', ({ x, y, id, color, name }) => {
    if (hasPlayerLost(name)) {
      socket.emit('invalidShot');
      return;
    }
    const colorData = { x, y, id, color, playerName: name };

    if (clickedSquares.has(id)) {
      socket.emit('invalidShot');
      return;
    }

    clickedSquares.add(id);
    io.emit('squareClicked', id);

    let hit = false;

    for (const player of playersList) {
      for (const ship of player.shipPositions) {
        for (let i = 0; i < ship.positions.length; i++) {
          const shipPosition = ship.positions[i];
          if (shipPosition[0] === y && shipPosition[1] === x) {
            hit = true;
            ship.isHit[i] = true;
            const shipName = ship.name;
            const ownerName = player.name;

            if (ship.isHit.every((pos) => pos)) {
              ship.isSunk = true;
              if (name === ownerName) {
                playerPoints[name] -= 20;
                io.emit(
                  'chat',
                  `${name} sänkte sin egen ${shipName} och har nu ${playerPoints[name]}!`,
                  botName
                );
              } else {
                playerPoints[name] += 20;
                io.emit(
                  'chat',
                  `${name} sänkte ${ownerName}s ${shipName} och har nu ${playerPoints[name]}!`,
                  botName
                );
              }
              io.emit('updatePlayerPoints', {
                playerName: name,
                points: playerPoints[name],
              });
            } else {
              if (name === ownerName) {
                playerPoints[name] -= 10;
                io.emit(
                  'chat',
                  `${name} träffade sin egen ${shipName} och har nu ${playerPoints[name]}!`,
                  botName
                );
              } else {
                playerPoints[name] += 10;
                io.emit(
                  'chat',
                  `${name} träffade ${ownerName}s ${shipName} och har nu ${playerPoints[name]}!`,
                  botName
                );
              }
            }
            const allSunk = player.shipPositions.every((ship) => ship.isSunk);
            if (allSunk && !playersLost.includes(player.name)) {
              playersLost.push(player.name);
              io.emit('chat', `${name} förlorade alla sina skepp!`, botName);
            }
            break;
          }
        }
        if (hit) break;
      }
      if (hit) break;
    }

    io.emit('colorChanged', colorData, hit);
    io.emit('squareId', id);

    console.log('PlayerPoints:', playerPoints);
  });

  function hasPlayerLost(playerName) {
    return playersLost.includes(playerName);
  }

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
