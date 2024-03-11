document.addEventListener('DOMContentLoaded', () => {
  const displayGrid = document.getElementById('gridDisplay');
  const userGrid = document.querySelector('.grid-user');
  const userSquares = [];
  const ships = document.querySelectorAll('.ship');
  const rowboat = document.querySelector('.rowboat-container');
  const sailboat = document.querySelector('.sailboat-container');
  const fishingboat = document.querySelector('.fishingboat-container');
  const pirateship = document.querySelector('.pirateship-container');
  const width = 10;

  function createBoard(grid, squares) {
    for (let i = 0; i < width * width; i++) {
      const square = document.createElement('div');
      square.dataset.id = i;
      grid.appendChild(square);
      squares.push(square);
    }
  }

  createBoard(userGrid, userSquares);

  console.log('Board created:', userGrid, userSquares);

  const shipArray = [
    {
      name: 'row boat',
      directions: [
        [0, 1],
        [0, width],
      ],
    },
    {
      name: 'sail boat',
      directions: [
        [0, 1, 2],
        [0, width, width * 2],
      ],
    },
    {
      name: 'fishing boat',
      directions: [
        [0, 1, 2, 3],
        [0, width, width * 2, width * 3],
      ],
    },
    {
      name: 'pirate ship',
      directions: [
        [0, 1, 2, 3, 4],
        [0, width, width * 2, width * 3, width * 4],
      ],
    },
    {
      name: 'rubber ruck',
      directions: [[0], [0, width]],
    },
    {
      name: 'grandpa with kid',
      directions: [[0], [0, width]],
    },
  ];

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
