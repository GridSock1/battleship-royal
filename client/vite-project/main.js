import { io } from 'socket.io-client';
const socket = io('http://localhost:3031');
//const socket = io('https://goldfish-app-e6acm.ondigitalocean.app');
import getRandomColor from './modules/randomColor.mjs';

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
sendBtn.addEventListener('click', () => {            //sidan behöver uppdateras för att namnet ska synas  !!!!
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
