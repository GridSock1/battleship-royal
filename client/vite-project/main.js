import { io } from 'socket.io-client';
const socket = io('https://goldfish-app-e6acm.ondigitalocean.app');

let sendMessage = document.getElementById('sendMessage');
let sendBtn = document.getElementById('sendBtn');
let chatList = document.getElementById('chatList');
let myName = localStorage.getItem('user');

//================================================
//==================   LOG IN   ==================
//================================================
const nameInput = document.getElementById('nameInput');
const joinBtn = document.getElementById('joinBtn');

joinBtn.addEventListener('click', () => {
  localStorage.getItem('user');
  let user = nameInput.value;
  localStorage.setItem('user', user);
  nameInput.value = '';
});

//=================================================
sendBtn.addEventListener('click', () => {
  let messageObject = { message: sendMessage.value, sender: myName };
  console.log('send chat', sendMessage.value);
  console.log('sender', messageObject.sender);
  socket.emit('chat', messageObject.message); //skickar meddelande
  updateChat(sendMessage.value, 'sent');
  sendMessage.value = '';
});

socket.on('chat', (arg) => {
  console.log('main.js - socket', arg);
  if (arg.sender !== myName) {
    updateChat(arg, 'received');
  }
});

function updateChat(chat, sender) {
  let li = document.createElement('li');
  li.innerText = chat;
  let div = document.createElement('div');
  let name = document.createElement('p');

  //div.classList.add('li-container')
  if (sender === 'sent') {
    li.classList.add('sent');
    div.classList.add('sent-container');
    name.innerText = myName;
  } else {
    li.classList.add('received');
    div.classList.add('received-container');
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
