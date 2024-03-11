import { io } from 'socket.io-client';
const socket = io('https://goldfish-app-e6acm.ondigitalocean.app');

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

function addPlayer() {
  let username = nameInput.value;
  let color = myColor; 
  localStorage.setItem('username', username);
  socket.emit('login', { username, color });

  socket.on('usersConnected', (playersList) => {
    usersList.innerHTML = '';

    playersList.forEach(player => {
        let listItem = document.createElement('li');
        listItem.classList.add('username');
        listItem.textContent = player.username;
        listItem.style.backgroundColor = player.color; 
        usersList.appendChild(listItem);
  });
}) 


}
//=================================================
//==============   PLAYERS LIST   =================
//=================================================
/*  socket.on('connect', () => {
  let user = localStorage.getItem('user');
  let userColor = localStorage.getItem('userColor');

  let listItem = document.createElement('li');
  listItem.classList.add('username');
  listItem.textContent = user; 
  listItem.style.backgroundColor = userColor; 
  usersList.appendChild(listItem);
})  */

socket.on('disconnect', () => {
  let username = localStorage.getItem('username');
 
  const index = playersList.indexOf(username);
  if (index !== -1) {
      playersList.splice(index, 1); 
      io.emit('usersConnected', playersList); 
  }
})  
//=================================================
//==========   ATTACKING BATTLEGROUND   ===========
//=================================================

document.addEventListener('DOMContentLoaded', () => {
  for (let i = 0; i < 100; i++) {
    let div = document.querySelector(`[data-id="${i}"]`);
    if (div) { 
      div.addEventListener('click', () => {
        div.style.backgroundColor = myColor; 
        div.style.borderRadius = '50%';
      }); 
    }
  }
});


//=================================================
//================   CHAT ROOM   ==================
//=================================================
sendBtn.addEventListener('click', () => {
  let messageObject = { message: sendMessage.value, sender: myName, color: myColor };
  console.log('send chat', sendMessage.value);
  console.log('sender', messageObject.sender);
  socket.emit('chat', messageObject); //skickar meddelande
  updateChat(sendMessage.value, 'sent');
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
