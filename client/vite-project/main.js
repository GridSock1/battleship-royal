import { io } from 'socket.io-client';
const socket = io('https://goldfish-app-e6acm.ondigitalocean.app');
// const socket = io('http://localhost:3032');
//import getRandomColor from './modules/randomColor.mjs';
import './game/game.js';
import { drawShips } from './game/game.js';

//================================================
//==================   GLOBAL   ==================
//================================================
// --- log in ---
const nameInput = document.getElementById('nameInput');
const joinBtn = document.getElementById('joinBtn');

// --- logged in users ---
const usersList = document.getElementById('usersList');

// --- chat ---
let sendMessage = document.getElementById('sendMessage');
let sendBtn = document.getElementById('sendBtn');
let chatList = document.getElementById('chatList');
let myName;
// --- user color ---
let myColor = 'pink';

socket.on('color', (color) => {
  myColor = color;
  localStorage.setItem('MyColor', myColor);
});

//================================================
//==================   LOG IN   ==================
//================================================
joinBtn.addEventListener('click', (e) => {
  e.preventDefault();
  addPlayer();
  nameInput.value = '';
});

//=================================================
//==============   PLAYERS LIST   =================
//=================================================
function addPlayer() {
  let username = nameInput.value;
  socket.emit('login', { username });
}

socket.on('usersConnected', (playersList) => {
  usersList.innerHTML = '';

  playersList.forEach((player) => {
    let listItem = document.createElement('li');
    listItem.classList.add('username');
    listItem.textContent = player.name;
    listItem.style.backgroundColor = player.color;
    usersList.appendChild(listItem);
  });
});

socket.on('playerSetup', ({ ships, color }) => {
  drawShips(ships, color);
  socket.emit('placeShipPositions', { playerId: socket.id, position: ships });
});

socket.on('disconnect', (disconnectedUser) => {
  let listItems = usersList.querySelectorAll('.username');
  listItems.forEach((listItem) => {
    if (listItem.textContent === disconnectedUser.username) {
      listItem.remove();
    }
  });
});
//=================================================
//=============   BATTLESHIP COLOR   ==============      in progress
//=================================================
let ships = document.querySelectorAll('.ship');

ships.forEach((ship) => {
  ship.style.backgroundColor = myColor;
});

//=================================================
//==========   ATTACKING BATTLEGROUND   ===========      in progress
//=================================================
/* socket.on('otherPlayersSetup', (otherPlayersInfo) => {
  // placera ut alla andras båtar på planen
  otherPlayersInfo.forEach(playerInfo => {
    placeOtherPlayerShips(playerInfo.ships, playerInfo.color);
  });
}); */

//==========================

socket.on('colorChanged', (colorData, hit) => {
  console.log('COLORCHANGE main.js line 99');
  let targetDiv = document.querySelector(`[data-id="${colorData.id}"]`);
  if (targetDiv) {
    targetDiv.style.backgroundColor = colorData.color;
    targetDiv.style.borderRadius = '50%';
    console.log(hit, 'hit main.js line 105');
    if (hit) {
      targetDiv.style.position = 'relative';
      targetDiv.style.textAlign = 'center';
      targetDiv.style.lineHeight = targetDiv.offsetHeight + 'px';
      targetDiv.style.fontSize = '26px';
      targetDiv.style.fontWeight = '700';
      targetDiv.innerText = 'X';
    }
  }
});

socket.on('PlayerPoints', (playerPoints) => {
  // let points = document.getElementById('pointsContainer');
  // let ul = document.createElement('ul');
  // let li = document.createElement('li');
  // li.textContent = playerPoints;
  // ul.appendChild(li);

  // points.appendChild(ul);
  /*  const playerNames = Object.keys(playerPoints);
  const playerScore = Object.values(playerPoints);

  console.log('Player Names:');
  playerNames.forEach((name, score) => console.log(name, score));
  console.log('Player Scores:');
  playerScore.forEach((score) => console.log(score));

  for (const player in playerPoints) {
    console.log('Player: ', player, 'Score', playerPoints);
  }
}); */

  socket.on('PlayerPoints', (playerPoints) => {
    console.log(playerPoints);

    let pointsContainer = document.getElementById('pointsContainer');

    pointsContainer.innerHTML = '';

    //  let ul = document.createElement('ul');
    for (let playerName in playerPoints) {
      let playerScore = playerPoints[playerName];
      localStorage.setItem('Points', playerScore);

      //let li = document.createElement('li');
      //li.textContent = `${playerName}: ${playerScore}`;
      //ul.appendChild(li);
    }
    //pointsContainer.appendChild(ul);
  });
});

// document.addEventListener('DOMContentLoaded', () => {
//   for (let i = 0; i < 1600; i++) {
//     let div = document.querySelector(`[data-id="${i}"]`);
//     if (div) {
//       div.addEventListener('click', () => {
//         div.style.backgroundColor = myColor; //ändra till spelarens färg
//         div.style.borderRadius = '50%';

//         //socket.emit('shoot', { position: i, color: myColor });
//         // socket.emit('shoot', { x: i % 40, y: Math.floor(i / 40), color: myColor, playerName: username });
//         console.log('COLORED main.js line 118');
//       });
//     }
//   }
// });

//=================================================
//================   CHAT ROOM   ==================
//=================================================
socket.on('username', (username) => {
  myName = username;
  localStorage.setItem('MyName', myName);
});

// Send message by pressing ENTER on keyboard
sendMessage.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendChatMessage();
  }
});

// Function to send chat message
function sendChatMessage() {
  let messageObject = {
    message: sendMessage.value,
    sender: myName,
    color: myColor,
  };
  console.log('send chat', sendMessage.value);
  console.log('sender', messageObject.sender);
  socket.emit('chat', messageObject);
  updateChat(sendMessage.value, 'sent');
  sendMessage.value = '';
}

// Send message by clicking sendBtn
sendBtn.addEventListener('click', sendChatMessage);

socket.on('chat', (arg, sender, color) => {
  updateChat(arg, sender, color, 'received');
});

function updateChat(chat, sender, color) {
  let li = document.createElement('li');
  li.innerText = chat;
  let div = document.createElement('div');
  let name = document.createElement('p');

  if (sender === 'sent') {
    li.classList.add('sent');
    div.classList.add('sent-container');
    name.innerText = myName;
    li.style.backgroundColor = myColor;
  } else {
    li.classList.add('received');
    div.classList.add('received-container');
    name.innerText = sender;
    li.style.backgroundColor = color;
  }
  div.appendChild(name);
  div.appendChild(li);
  chatList.appendChild(div);

  scrollToBottom();
}

//================================================
//==============   CHAT BOX SCROLL   =============
//================================================
function scrollToBottom() {
  const chatBox = document.getElementById('chatBox');
  chatBox.scrollTop = chatBox.scrollHeight;
}
