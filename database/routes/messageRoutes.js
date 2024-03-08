const express = require('express');
const {
  sendMessage,
  getMessages,
} = require('../controllers/messageController.js');
const router = express.Router();

router.get('/', getMessages);
router.post('/send', sendMessage);

module.exports = router;
