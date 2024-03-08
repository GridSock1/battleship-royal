const mongoose = require('mongoose');

var messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    userName: {
      type: String,
      index: true,
    },
    userColor: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', messageSchema);
