const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var sessionSchema = new mongoose.Schema({
  session: {
    type: String,
    index: true,
  },
  players: [
    {
      playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    },
  ],
  dropOut: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
  ],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  },
});

//Export the model
module.exports = mongoose.model('Session', sessionSchema);
