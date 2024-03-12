import { io } from 'socket.io-client';
const socket = io('https://goldfish-app-e6acm.ondigitalocean.app');
// const socket = io('http://localhost:3031');
import getRandomColor from './modules/randomColor.mjs';
import './game/game.js';

const usersList = document.getElementById('usersList');
let sendMessage = document.getElementById('sendMessage');
let sendBtn = document.getElementById('sendBtn');
let chatList = document.getElementById('chatList');
let myName = localStorage.getItem('username');
let myColor = getRandomColor();

//================================================
//==================   LOG IN   ==================
//================================================
const nameInput = document.getElementById('nameInput');
const joinBtn = document.getElementById('joinBtn');

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
  let color = myColor;
  localStorage.setItem('username', username);
  socket.emit('login', { username, color });

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
}

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

socket.on('colorChanged', (colorData) => {
  let targetDiv = document.querySelector(`[data-id="${colorData.position}"]`);
  if (targetDiv) {
    targetDiv.style.backgroundColor = colorData.color; //lägga till en div istället?
    targetDiv.style.borderRadius = '50%';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  for (let i = 0; i < 1600; i++) {
    let div = document.querySelector(`[data-id="${i}"]`);
    if (div) {
      div.addEventListener('click', () => {
        div.style.backgroundColor = myColor;
        div.style.borderRadius = '50%';

        socket.emit('colorChange', { position: i, color: myColor });
      });
    }
  }
});
//=================================================
//================   CHAT ROOM   ==================
//=================================================

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
