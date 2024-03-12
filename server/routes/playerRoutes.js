const express = require('express');
const { newPlayer } = require('../controllers/playerController.js');
const router = express.Router();

router.post('/', newPlayer);

module.exports = router;
