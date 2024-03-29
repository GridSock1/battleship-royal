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
  socket.on('squareId', (squareId) => {
    console.log('Received squareId:', squareId);

    const square = document.querySelector(`[data-id='${squareId}']`);
    if (square) {
      square.removeEventListener('click', shootHandler);
    }
  });

  socket.on('squareClicked', (squareId) => {
    console.log('Square clicked ID:', squareId);
    const square = document.querySelector(`[data-id='${squareId}']`);
    if (square) {
      square.classList.add('disabled');
    }
  });

  function shootHandler(event) {
    const square = event.target;
    const clickedX = parseInt(square.dataset.x);
    const clickedY = parseInt(square.dataset.y);
    socket.emit('shoot', {
      x: clickedX,
      y: clickedY,
      id: square.dataset.id,
      color: localStorage.getItem('MyColor'),
      name: localStorage.getItem('MyName'),
    });
  }

  function createBoard(grid, squares, width) {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < width; y++) {
        const square = document.createElement('div');
        square.dataset.x = x;
        square.dataset.y = y;
        square.dataset.id = x * width + y;

        square.addEventListener('click', shootHandler);

        grid.appendChild(square);
        squares.push(square);
      }
    }
  }

  createBoard(userGrid, userSquares, width);

  // const forbiddenShipsArray = [
  //   {
  //     name: 'rubberduck',
  //     directions: [[0]],
  //     className: 'rubberduck-container',
  //   },
  //   {
  //     name: 'grandpawithkid',
  //     directions: [[0]],
  //     className: 'grandpakid-container',
  //   },
  // ];

  //   function placeForbiddenShips() {
  //     forbiddenShipsArray.forEach((ship) => {
  //       let isValidPlacement = false;
  //       while (!isValidPlacement) {
  //         const randomDirectionIndex = Math.floor(
  //           Math.random() * ship.directions.length
  //         );
  //         const randomDirection = ship.directions[randomDirectionIndex];
  //         const randomStartIndex = Math.floor(Math.random() * width * width);
  //         const startX = randomStartIndex % width;
  //         const startY = Math.floor(randomStartIndex / width);
  //         isValidPlacement = true;
  //         for (let i = 0; i < randomDirection.length; i++) {
  //           const nextX = startX + (randomDirection[i] % width);
  //           const nextY = startY + Math.floor(randomDirection[i] / width);
  //           if (
  //             nextX >= width ||
  //             nextY >= width ||
  //             userSquares[nextX + nextY * width].classList.contains('taken')
  //           ) {
  //             isValidPlacement = false;
  //             break;
  //           }
  //         }
  //         if (isValidPlacement) {
  //           for (let i = 0; i < randomDirection.length; i++) {
  //             const nextX = startX + (randomDirection[i] % width);
  //             const nextY = startY + Math.floor(randomDirection[i] / width);
  //             const square = userSquares[nextX + nextY * width];
  //             square.classList.add('taken');
  //             square.classList.add(ship.name);
  //             square.dataset.ship = ship.name;
  //           }
  //         }
  //       }
  //     });
  //   }

  //   placeForbiddenShips();
});

// function emitShipPositions(shipPositions) {
//   socket.emit('placeShipPositions', shipPositions);
// }
