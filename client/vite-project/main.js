import { io } from 'socket.io-client';
//const socket = io('https://goldfish-app-e6acm.ondigitalocean.app');
const socket = io('http://localhost:3031');
import getRandomColor from './modules/randomColor.mjs';
import './game/game.js';


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
  addPlayer(); 
  let userColor = getRandomColor(); 
  localStorage.setItem('userColor', userColor);

  nameInput.value = '';
  
});

function addPlayer() {
  let user = nameInput.value;
  localStorage.setItem('user', user);
  socket.emit('login', user);

  socket.on('usersConnected', (playersList) => {
    usersList.innerHTML = '';

    playersList.forEach(player => {
        let listItem = document.createElement('li');
        listItem.classList.add('username');
        listItem.textContent = player;
        listItem.style.backgroundColor = myColor; 
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
  let user = localStorage.getItem('user');
 
  const index = playersList.indexOf(user);
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
      if (div) { // Kontrollera om div hittades innan du lägger till händelselyssnare
          div.addEventListener('click', () => {
            //  let userColor = localStorage.getItem('userColor');
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
