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

const {
  userJoin,
  currentUser,
  userLeave,
  saveUserToMongoDB,
} = require('./users.js');
const { createAndPlaceShips } = require('./game-test.js');

const Message = require('./models/messageModel.js');
const Player = require('./models/playerModel.js');

mongoose
  .connect(
    'mongodb+srv://jarileminaho:PMc7xtzaX4yXKJM1@cluster0.rf4p1sc.mongodb.net/battleship_live_3?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(() => {
    console.log('Connected to MongoDB from server');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const playerPointsSchema = new mongoose.Schema({
  name: String,
  points: Number,
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
  socket.on('login', ({ username }) => {
    const color = generateColor();

    const user = userJoin(socket.id, username, color);
    playerPoints[user.name] = 0;
    socket.join(user.id);

    const shipPositions = createAndPlaceShips(userSquares);
    user.addShipPositions(shipPositions);

    saveUserToMongoDB(user);

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
    console.log('Game is starting...');

    for (const player of playersList) {
      const shipPositions = createAndPlaceShips();
      io.to(player.id).emit('placeShips', shipPositions);
    }
  }

  socket.on('placeShipPositions', (positions) => {
    const { playerId, position } = positions;

    if (position && Array.isArray(position)) {
      position.forEach((ship, index) => {});
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
  const PlayerPoints = mongoose.model('PlayerPoints', playerPointsSchema);

  socket.on('shoot', async ({ x, y, id, color, name }) => {
    if (hasPlayerLost(name)) {
      socket.emit('invalidShot');
      return;
    }

    const colorData = { x, y, id, color, playerName: name };

    if (clickedSquares.has(id)) {
      socket.emit('invalidShot');
      return;
    }

    let allShipsSunk = true;
    for (const player of playersList) {
      if (player.name === name) {
        allShipsSunk = player.shipPositions.every((ship) => ship.isSunk);
        break;
      }
    }

    if (allShipsSunk) {
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
              console.log('PLAYERLIST AFTER SHIPS LOST', playersList);
              io.emit(
                'chat',
                `${name} sköt sönder ${player.name}s sista skepp!`,
                botName
              );

              io.emit('playersOut', playersLost);

              playersList = playersList.filter((p) => p.name !== player.name);

              if (playersList.length === 1) {
                const remainingPlayer = playersList[0];
                io.emit('winner', remainingPlayer.name);
              }
            }
            break;
          }
        }
        if (hit) break;
      }
      if (hit) break;
    }

    try {
      let playerPointsRecord = await PlayerPoints.findOne({ name });
      if (!playerPointsRecord) {
        playerPointsRecord = new PlayerPoints({
          name,
          points: playerPoints[name],
        });
      } else {
        playerPointsRecord.points = playerPoints[name];
        console.log('PlayerPoints:', playerPointsRecord);
      }
      await playerPointsRecord.save();
      io.emit('PlayerPoints', playerPoints);
    } catch (error) {
      console.error('Error saving player points:', error);
    }

    io.emit('colorChanged', colorData, hit);
    io.emit('squareId', id);
  });

  function hasPlayerLost(playerName) {
    return playersLost.includes(playerName);
  }

  socket.emit(
    'chat',
    'Välkommen till chatten! Kom ihåg att alltid skriva snälla saker. :)',
    botName
  );

  socket.on('fetchChatHistory', async () => {
    try {
      const allMessages = await Message.find();
      const messagesJSON = JSON.stringify(allMessages);
      socket.emit('chatHistory', messagesJSON);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  });

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

      socket.broadcast.emit('chat', arg.message, arg.sender, arg.color);
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  });
});

server.listen(process.env.PORT || '3032');
