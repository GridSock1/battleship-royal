const mongoose = require('mongoose');

const playerPointsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  points: {
    type: Number,
    default: 0,
  },
});

const shipPositionSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
  },
  shipName: {
    type: String,
    required: true,
  },
  positions: {
    type: [[Number]],
    required: true,
  },
});

const gameStateSchema = new mongoose.Schema({
  winner: {
    type: String,
    required: true,
  },
  players: [playerPointsSchema],
  shipPositions: [shipPositionSchema],
  entireBoardState: {
    type: Object,
    required: true,
  },
});

const GameState = mongoose.model('GameState', gameStateSchema);

module.exports = GameState;
