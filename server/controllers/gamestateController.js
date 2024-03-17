const GameState = require('../models/gamestateModel.js'); // Assuming the path to your model file

// Controller methods for managing game states
const gameStateController = {
  // Get all game states
  getAllGameStates: async (req, res) => {
    try {
      const gameStates = await GameState.find();
      res.json(gameStates);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create a new game state
  createGameState: async (req, res) => {
    const gameState = new GameState(req.body);
    try {
      const savedGameState = await gameState.save();
      res.status(201).json(savedGameState);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get a specific game state by ID
  getGameStateById: async (req, res) => {
    try {
      const gameState = await GameState.findById(req.params.id);
      if (gameState == null) {
        return res.status(404).json({ message: 'Game state not found' });
      }
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update a game state
  updateGameState: async (req, res) => {
    try {
      const updatedGameState = await GameState.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json(updatedGameState);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete a game state
  deleteGameState: async (req, res) => {
    try {
      await GameState.findByIdAndDelete(req.params.id);
      res.json({ message: 'Game state deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update game state with shoot action
  updateGameStateWithShoot: async (playerName, x, y) => {
    // Your implementation of updating game state with shoot action goes here
  },
};

module.exports = gameStateController;
