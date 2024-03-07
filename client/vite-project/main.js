import { io } from 'socket.io-client';
//const socket = io('https://goldfish-app-e6acm.ondigitalocean.app');
const socket = io('http://localhost:3031');

//const joinContainer = document.getElementById('joinContainer'); 
const usersList = document.getElementById('usersList');

let sendMessage = document.getElementById('sendMessage');
let sendBtn = document.getElementById('sendBtn');
let chatList = document.getElementById('chatList');
let myName = localStorage.getItem('user');

//================================================
//==================   LOG IN   ==================
//================================================
const nameInput = document.getElementById('nameInput');
const joinBtn = document.getElementById('joinBtn');

joinBtn.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.getItem('user');
  let user = nameInput.value;
  localStorage.setItem('user', user);  
  nameInput.value = '';
  
});
//=================================================
//==============   PLAYERS LIST   =================
//=================================================
socket.on('connect', (user) => {
  let user = localStorage.getItem('user');
  let listItem = document.createElement('li');
  listItem.textContent = user; 
  usersList.appendChild(listItem);
})

socket.on('disconnect', () => {
  let user = localStorage.getItem('user');
  let listItems = usersList.getElementsByTagName('li');

  for (let i = 0; i < listItems.length; i++) {
    if (listItems[i].textContent === user) {
      listItems[i].remove(); 
      break;
    }
  }
})

//=================================================
sendBtn.addEventListener('click', () => {
  let messageObject = { message: sendMessage.value, sender: myName };
  console.log('send chat', sendMessage.value);
  console.log('sender', messageObject.sender);
  socket.emit('chat', messageObject); //skickar meddelande
  updateChat(sendMessage.value, 'sent');
  sendMessage.value = '';
});

/* socket.on('chat', (messageObject) => {
  console.log('main.js - socket', messageObject);
  updateChat(messageObject.message, messageObject.sender, 'received'); // inkludera avsändarens namn när du uppdaterar chatten
}); */

socket.on('chat', (arg, sender) => {
  console.log('main.js - socket', arg);
  // const message = {
  //   ...arg,
  //   sender: arg.sender,
  // };
  updateChat(arg, sender, 'received');
});

/* socket.on('chat', (arg) => {
  console.log('main.js - socket', arg);
  updateChat(arg, 'received');
}); */

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
    name.innerText = sender;
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
