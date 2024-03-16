import { io } from 'socket.io-client';
const socket = io('https://goldfish-app-e6acm.ondigitalocean.app');
// const socket = io('http://localhost:3032');
//import getRandomColor from './modules/randomColor.mjs';
import './game/game.js';
import { drawShips } from './game/game.js';
import mongoose from 'mongoose';

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

let playersList;

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

socket.on('usersConnected', (receivedPlayersList) => {
  playersList = receivedPlayersList;
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
  console.log('playerpoints', playerPoints);

  let pointsContainer = document.getElementById('pointsContainer');
  pointsContainer.innerHTML = '';

  // Iterate through each player in the playersList and display their points if available
  playersList.forEach((player) => {
    if (playerPoints[player.name] !== undefined) {
      const listItem = document.createElement('li');
      listItem.textContent = `${player.name}: ${playerPoints[player.name]}`;
      pointsContainer.appendChild(listItem); // Append the list item to the points container
    }
  });
});

// socket.on('PlayerPoints', (playerPoints) => {
//   console.log('playerpoints', playerPoints);

//   let pointsContainer = document.getElementById('pointsContainer');
//   pointsContainer.innerHTML = '';

//   Object.keys(playerPoints).forEach((playerName) => {
//     const listItem = document.createElement('li');
//     listItem.textContent = `${playerName}: ${playerPoints[playerName]}`;
//     pointsContainer.appendChild(listItem); // Append the list item to the points container
//   });
// });

//=================================================
//================   CHAT ROOM   ==================
//=================================================
socket.on('username', (username) => {
  myName = username;
  localStorage.setItem('MyName', myName);
});

sendMessage.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendChatMessage();
  }
});

function fetchChatHistory() {
  socket.emit('fetchChatHistory');
}

window.addEventListener('load', fetchChatHistory);

socket.on('chatHistory', (messagesJSON) => {
  const messages = JSON.parse(messagesJSON);
  messages.forEach((message) => {
    updateChat(
      message.content,
      message.userName,
      message.userColor,
      'received'
    );
  });
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

function updateChat(chat, sender, color, messageType) {
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
