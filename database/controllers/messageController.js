const expressAsyncHandler = require('express-async-handler');
const Message = require('../models/messageModel.js');

const { connected } = require('../../server/app.js');

const sendMessage = expressAsyncHandler((req, res) => {
  if (!connected) {
    return res
      .status(500)
      .json({ message: 'Failed to connect to the database' });
  }

  const { content } = req.body;
  try {
    const newMsg = new Message({
      content: content,
      userName: userName,
    });

    newMsg.save();

    console.log(newMsg);

    res.json(newMsg);
    console.log(newMsg);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to save message', error: error.message });
  }
});

const getMessages = expressAsyncHandler(async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
});

module.exports = { sendMessage, getMessages };
