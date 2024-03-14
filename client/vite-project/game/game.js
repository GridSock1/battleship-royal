import { io } from 'socket.io-client';
const socket = io('https://goldfish-app-e6acm.ondigitalocean.app');
// const socket = io('http://localhost:3032');

const userGrid = document.getElementById('gridDisplay');
const userSquares = [];
const squares = [];
const width = 30;

socket.on('color', (color) => {
  myColor = color;
});

export function drawShips(shipPositions, color) {
  shipPositions.forEach((ship) => {
    ship.positions.forEach((pos) => {
      const [x, y] = pos;
      const square = userSquares[x + y * width];
      square.classList.add('taken', ship.name);
      square.dataset.ship = ship.name;
      square.style.backgroundColor = color;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const forbiddenShipsArray = [
    {
      name: 'rubberduck',
      directions: [[0]],
      className: 'rubberduck-container',
    },
    {
      name: 'grandpawithkid',
      directions: [[0]],
      className: 'grandpakid-container',
    },
  ];

  socket.on('squareId', (squareId) => {
    // Handle the received squareId here
    console.log('Received squareId:', squareId);

    // Find the square element with the corresponding ID
    const square = document.querySelector(`[data-id='${squareId}']`);
    if (square) {
      // Remove the click event listener from the square
      square.removeEventListener('click', shootHandler);

      // You can perform any additional UI updates here if needed
    }
  });

  socket.on('squareClicked', (squareId) => {
    // Find the square element with the corresponding ID
    const square = document.querySelector(`[data-id='${squareId}']`);
    if (square) {
      // Disable the square (remove click event listener or add disabled attribute)
      square.classList.add('disabled');
    }
  });

  function createBoard(grid, squares, width) {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < width; y++) {
        const square = document.createElement('div');
        square.dataset.x = x;
        square.dataset.y = y;
        square.dataset.id = x * width + y;

        square.addEventListener('click', function shootHandler() {
          const clickedX = parseInt(square.dataset.x);
          const clickedY = parseInt(square.dataset.y);
          socket.emit('shoot', {
            x: clickedX,
            y: clickedY,
            id: square.dataset.id,
            color: localStorage.getItem('MyColor'),
            name: localStorage.getItem('MyName'),
          });

          // Immediately remove the click event listener from the square
          square.removeEventListener('click', shootHandler);

          // Emit an event to inform all clients to deactivate the square
          socket.emit('deactivateSquare', square.dataset.id);
        });

        grid.appendChild(square);
        squares.push(square);
      }
    }
  }

  createBoard(userGrid, userSquares, width);

  function placeForbiddenShips() {
    forbiddenShipsArray.forEach((ship) => {
      let isValidPlacement = false;
      while (!isValidPlacement) {
        const randomDirectionIndex = Math.floor(
          Math.random() * ship.directions.length
        );
        const randomDirection = ship.directions[randomDirectionIndex];
        const randomStartIndex = Math.floor(Math.random() * width * width);
        const startX = randomStartIndex % width;
        const startY = Math.floor(randomStartIndex / width);
        isValidPlacement = true;
        for (let i = 0; i < randomDirection.length; i++) {
          const nextX = startX + (randomDirection[i] % width);
          const nextY = startY + Math.floor(randomDirection[i] / width);
          if (
            nextX >= width ||
            nextY >= width ||
            userSquares[nextX + nextY * width].classList.contains('taken')
          ) {
            isValidPlacement = false;
            break;
          }
        }
        if (isValidPlacement) {
          for (let i = 0; i < randomDirection.length; i++) {
            const nextX = startX + (randomDirection[i] % width);
            const nextY = startY + Math.floor(randomDirection[i] / width);
            const square = userSquares[nextX + nextY * width];
            square.classList.add('taken');
            square.classList.add(ship.name);
            square.dataset.ship = ship.name;
          }
        }
      }
    });
  }

  placeForbiddenShips();
});

function emitShipPositions(shipPositions) {
  socket.emit('placeShipPositions', shipPositions);
}
