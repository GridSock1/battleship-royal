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
    listItem.textContent = player.username;
    listItem.style.backgroundColor = player.color;
    usersList.appendChild(listItem);
  });
});

socket.on('playerSetup', ({ ships, color }) => {
  // nya spelarens båtar
  // console.log('placerade båtar', ships, color);
  // const shipPositions = drawShips(ships, color)
  drawShips(ships, color);
  socket.emit('placeShipPositions', { playerId: socket.id, position: ships });
  // console.log('båtpositioner', ships);
  // placePlayerShips(ships, color);
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
  //console.log(targetDiv, 'targetDiv')
  if (targetDiv) {
    targetDiv.style.backgroundColor = colorData.color; //lägga till en div istället?
    targetDiv.style.borderRadius = '50%';
    console.log(hit, 'hit main.js line 105');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  for (let i = 0; i < 1600; i++) {
    let div = document.querySelector(`[data-id="${i}"]`);
    if (div) {
      div.addEventListener('click', () => {
        div.style.backgroundColor = myColor; //ändra till spelarens färg
        div.style.borderRadius = '50%';

        //socket.emit('shoot', { position: i, color: myColor });
        // socket.emit('shoot', { x: i % 40, y: Math.floor(i / 40), color: myColor, playerName: username });
        console.log('COLORED main.js line 118');
      });
    }
  }
});

//=================================================
//================   CHAT ROOM   ==================
//=================================================
socket.on('username', (username) => {
  myName = username;
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
  socket.emit('chat', messageObject); // Sends message
  updateChat(sendMessage.value, 'sent');
  sendMessage.value = ''; // Clear input field after sending
}

// Send message by clicking sendBtn
sendBtn.addEventListener('click', sendChatMessage);

socket.on('chat', (arg, sender, color) => {
  console.log('main.js - socket', arg);
  updateChat(arg, sender, color, 'received');
});

/* socket.on('chatMessage', ({ message, sender }) => {
  const messageElement = document.createElement('li');
  messageElement.classList.add('received');
  messageElement.textContent = `${sender}: ${message}`;
  chatList.appendChild(messageElement);
}); */

function updateChat(chat, sender, color) {
  let li = document.createElement('li');
  li.innerText = chat;
  let div = document.createElement('div');
  let name = document.createElement('p');

  //div.classList.add('li-container')
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
