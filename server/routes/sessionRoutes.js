const express = require('express');
const { newSession } = require('../controllers/sessionController.js');
const router = express.Router();

router.post('/', newSession);

module.exports = router;
