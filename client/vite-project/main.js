import { io } from 'socket.io-client';

import getRandomColor from './modules/randomColor.mjs';
import './game/game.js';
const socket = io('http://localhost:3032');

//const joinContainer = document.getElementById('joinContainer');
const usersList = document.getElementById('usersList');
let sendMessage = document.getElementById('sendMessage');
let sendBtn = document.getElementById('sendBtn');
let chatList = document.getElementById('chatList');
let myName = localStorage.getItem('user');
let myColor = localStorage.getItem('userColor');

//================================================
//==================   LOG IN   ==================
//================================================
const nameInput = document.getElementById('nameInput');
const joinBtn = document.getElementById('joinBtn');

joinBtn.addEventListener('click', (e) => {
  e.preventDefault();
  let user = nameInput.value;
  localStorage.setItem('user', user);

  let userColor = getRandomColor();
  localStorage.setItem('userColor', userColor);

  nameInput.value = '';
});
//=================================================
//==============   PLAYERS LIST   =================
//=================================================
socket.on('connect', () => {
  let user = localStorage.getItem('user');
  let userColor = localStorage.getItem('userColor');

  let listItem = document.createElement('li');
  listItem.classList.add('username');
  listItem.textContent = user;
  listItem.style.backgroundColor = userColor;
  usersList.appendChild(listItem);
});

socket.on('disconnect', () => {
  let user = localStorage.getItem('user');
  let listItems = usersList.getElementsByTagName('li');

  for (let i = 0; i < listItems.length; i++) {
    if (listItems[i].textContent === user) {
      listItems[i].remove();
      break;
    }
  }
});

//=================================================
sendBtn.addEventListener('click', () => {
  let messageObject = {
    message: sendMessage.value,
    sender: myName,
    color: myColor,
  };
  console.log('send chat', sendMessage.value);
  console.log('sender', messageObject.sender);
  socket.emit('chat', messageObject); //skickar meddelande
  updateChat(sendMessage.value, 'sent', myName);
  sendMessage.value = '';
});

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
  div.appendChild(li);
  div.appendChild(name);
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
