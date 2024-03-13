document.addEventListener('DOMContentLoaded', () => {
  const displayGrid = document.querySelector('grid-user');
  const userGrid = document.getElementById('gridDisplay');
  const userSquares = [];
  const ships = document.querySelectorAll('.ship');
  const rowboat = document.querySelector('.rowboat-container');
  const sailboat = document.querySelector('.sailboat-container');
  const fishingboat = document.querySelector('.fishingboat-container');
  const pirateship = document.querySelector('.pirateship-container');
  const width = 40;

  function handleSquareClick(square) {
    const squareId = square.dataset.id;
    console.log('SquareID:', squareId)

    if (square.classList.contains('taken')) {
        const shipName = square.dataset.ship;
        console.log(`Du träffade ${shipName}!`);
    } else {
        console.log('Du missade!');
    }
}

const shipsArray = [
  {
    name: 'rowboat',
    directions: [
      [0, 1],
      [0, width],
    ],
  },
  {
    name: 'sailboat',
    directions: [
      [0, 1, 2],
      [0, width, width * 2],
    ],
  },
  {
    name: 'fishingboat',
    directions: [
      [0, 1, 2, 3],
      [0, width, width * 2, width * 3],
    ],
  },
  {
    name: 'pirateship',
    directions: [
      [0, 1, 2, 3, 4],
      [0, width, width * 2, width * 3, width * 4],
    ],
  },  
];

const forbiddenShipsArray = [
  {
    name: 'rubberruck',
    directions: [[0]],
  },
  {
    name: 'grandpawithkid',
    directions: [[0]],
  },
];

  function createBoard(grid, squares) {
    for (let i = 0; i < width * width; i++) {
      const square = document.createElement('div');
      square.dataset.id = i;
      square.addEventListener('click', () => {
        handleSquareClick(square);
      });
      grid.appendChild(square);
      squares.push(square);
    }
    placeForbiddenShips();
    createAndPlaceShips();
  }

  createBoard(userGrid, userSquares);

 // console.log('Board created:', userGrid, userSquares);
  
  function placeForbiddenShips() {
    forbiddenShipsArray.forEach(ship => {
      let isValidPlacement = false;
      while (!isValidPlacement) {
        const randomDirectionIndex = Math.floor(Math.random() * ship.directions.length);
        const randomDirection = ship.directions[randomDirectionIndex];
        const randomStartIndex = Math.floor(Math.random() * width * width);
        const startX = randomStartIndex % width;
        const startY = Math.floor(randomStartIndex / width);
        isValidPlacement = true;
        for (let i = 0; i < randomDirection.length; i++) {
          const nextX = startX + randomDirection[i] % width;
          const nextY = startY + Math.floor(randomDirection[i] / width);
          if (nextX >= width || nextY >= width || userSquares[nextX + nextY * width].classList.contains('taken')) {
            isValidPlacement = false;
            break;
          }
        }
        if (isValidPlacement) {
          for (let i = 0; i < randomDirection.length; i++) {
            const nextX = startX + randomDirection[i] % width;
            const nextY = startY + Math.floor(randomDirection[i] / width);
            userSquares[nextX + nextY * width].classList.add('taken');
            userSquares[nextX + nextY * width].dataset.ship = ship.name;
          }
        }
      }
    }); 
  }

  function createAndPlaceShips(color) {
    shipsArray.forEach(ship => {
      let isValidPlacement = false;
      while (!isValidPlacement) {
        const randomDirectionIndex = Math.floor(Math.random() * ship.directions.length);
        const randomDirection = ship.directions[randomDirectionIndex];
        const randomStartIndex = Math.floor(Math.random() * width * width);
        const startX = randomStartIndex % width;
        const startY = Math.floor(randomStartIndex / width);
        isValidPlacement = true;
        for (let i = 0; i < randomDirection.length; i++) {
          const nextX = startX + randomDirection[i] % width;
          const nextY = startY + Math.floor(randomDirection[i] / width);
          if (nextX >= width || nextY >= width || userSquares[nextX + nextY * width].classList.contains('taken')) {
            isValidPlacement = false;
            break;
          }
        }
        if (isValidPlacement) {
          for (let i = 0; i < randomDirection.length; i++) {
            const nextX = startX + randomDirection[i] % width;
            const nextY = startY + Math.floor(randomDirection[i] / width);
            const square = userSquares[nextX + nextY * width];
            square.classList.add('taken');
            square.style.backgroundColor = color; // Tilldela färgen till skeppet
          }
        }
      }
    });
  }


  // function generate(ship) {
  //   let randomDirection = Math.floor(Math.random() * ship.directions.length);
  //   let current = ship.directions[randomDirection];

  //   if (randomDirection === 0) direction = 1;
  //   if (randomDirection === 1) direction = 10;

  //   let randomStart = Math.abs(
  //     Math.floor(
  //       Math.random() * userSquares.length -
  //         ship.directions[0].length * direction
  //     )
  //   );

  //   const isTaken = current.some((index) =>
  //     userSquares[randomStart + index].classList.contains('taken')
  //   );
  //   const isAtRightEdge = current.some(
  //     (index) => (randomStart + index) % width === width - 1
  //   );
  //   const isAtLeftEdge = current.some(
  //     (index) => (randomStart + index) % width === 0
  //   );

  //   if (!isTaken && !isAtRightEdge && !isAtLeftEdge)
  //     current.forEach((index) =>
  //       userSquares[randomStart + index].classList.add('taken', ship.name)
  //     );
  //   else generate(ship);
  // }
});

module.exports = {
  createAndPlaceShips
}
