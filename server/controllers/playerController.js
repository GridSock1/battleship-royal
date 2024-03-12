const expressAsyncHandler = require('express-async-handler');
const Player = require('../models/playerModel.js');

const newPlayer = expressAsyncHandler(async (req, res) => {
  const { userName } = req.body;

  try {
    const player = new Player({
      name: userName,
    });

    player.save();

    res.json(player);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to save player', error: error.message });
  }
});

module.exports = {
  newPlayer,
};
