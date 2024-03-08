const mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
  content: {
    type: String,
    index: true,
  },
  userName: {
    type: String,
  },
});

module.exports = mongoose.model('Message', messageSchema);
