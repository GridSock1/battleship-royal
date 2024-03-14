const width = 30;

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

function placeForbiddenShips() {
  const forbiddenShipPositions = [];
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
        if (nextX >= width || nextY >= width) {
          isValidPlacement = false;
          break;
        }
      }
      if (isValidPlacement) {
        const shipPosition = randomDirection.map((offset) => {
          const x = startX + (offset % width);
          const y = startY + Math.floor(offset / width);
          return [x, y];
        });
        forbiddenShipPositions.push({
          name: ship.name,
          positions: shipPosition,
        });
      }
    }
  });
  return forbiddenShipPositions;
}

function createAndPlaceShips() {
  const shipPositions = [];
  shipsArray.forEach((ship) => {
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
      const shipPosition = {
        name: ship.name,
        positions: [],
      };
      for (let i = 0; i < randomDirection.length; i++) {
        const nextX = startX + (randomDirection[i] % width);
        const nextY = startY + Math.floor(randomDirection[i] / width);
        if (nextX >= width || nextY >= width) {
          isValidPlacement = false;
          break;
        }
        shipPosition.positions.push([nextX, nextY]);
      }
      if (isValidPlacement) {
        shipPositions.push(shipPosition);
      }
    }
  });

  console.log('Generated Ship Positions:');
  shipPositions.forEach((ship) => {
    console.log(`Ship: ${ship.name}`);
    ship.positions.forEach((position) => {
      console.log(`Position: (${position[0]}, ${position[1]})`);
    });
  });

  return shipPositions;
}

module.exports = {
  createAndPlaceShips,
  placeForbiddenShips,
};
