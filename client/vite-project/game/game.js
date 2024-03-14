import { io } from 'socket.io-client';
const socket = io('https://goldfish-app-e6acm.ondigitalocean.app');
// const socket = io('http://localhost:3032');

//const displayGrid = document.querySelector('grid-user');
const userGrid = document.getElementById('gridDisplay');
const userSquares = [];
const squares = [];
/* const ships = document.querySelectorAll('.ship');
const rowboat = document.querySelector('.rowboat-container');
const sailboat = document.querySelector('.sailboat-container');
const fishingboat = document.querySelector('.fishingboat-container');
const pirateship = document.querySelector('.pirateship-container'); */
const width = 40;

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
  /* function handleSquareClick(square) {
    const squareId = square.dataset.id;
    console.log('SquareID:', squareId);

    if (square.classList.contains('taken')) {
      const shipName = square.dataset.ship;
      console.log(`Du träffade ${shipName}!`);
    } else {
      console.log('Du missade!');
    }
    // socket.emit('shoot', { squareId });
  } */

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

  function createBoard(grid, squares, width) {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < width; y++) {
        const square = document.createElement('div');
        square.dataset.x = x;
        square.dataset.y = y;

        square.dataset.id = x * width + y; // Calculate the index based on row and column
        /*  square.addEventListener('click', () => {
          handleSquareClick(square);
        }); */
        square.addEventListener('click', () => {
          const clickedX = parseInt(square.dataset.x); // Retrieve x-coordinate from dataset
          const clickedY = parseInt(square.dataset.y); // Retrieve y-coordinate from dataset
          console.log('CLICK AT POSITION', clickedX, clickedY);
          socket.emit('shoot', { x: clickedX, y: clickedY });
        });
        grid.appendChild(square);
        squares.push(square);
      }
    }
  }

  // function createBoard(grid, squares) {
  //   for (let i = 0; i < width * width; i++) {
  //     const square = document.createElement('div');
  //     square.dataset.id = i;
  //     square.addEventListener('click', () => {
  //       handleSquareClick(square);
  //     });
  //     square.addEventListener('click', () => {
  //       console.log('CLICK I RUTE', i);
  //     });
  //     grid.appendChild(square);
  //     squares.push(square);
  //   }
  // }

  // createBoard(userGrid, userSquares);
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

  // socket.on('playerSetup', ({ ships, color }) => {
  //   drawShips(ships, userSquares, width, color);
  // });
});

// export { drawShips };

function emitShipPositions(shipPositions) {
  socket.emit('placeShipPositions', shipPositions);
}
