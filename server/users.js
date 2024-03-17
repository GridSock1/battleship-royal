const { User } = require('./User.js');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: String,
  name: String,
  color: String,
  shipPositions: [Object],
});

const UserModel = mongoose.model('User', UserSchema);

const users = [];

function userJoin(id, username, color, userShips) {
  const user = new User(id, username, color, userShips);
  users.push(user);
  return user;
}

function currentUser(id) {
  return users.find((user) => user.id === id);
}

function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
  localStorage.clear();
}

async function saveUserToMongoDB(user) {
  try {
    const userModel = new UserModel(user);
    await userModel.save();
    console.log('User saved to MongoDB:', user);
  } catch (error) {
    console.error('Error saving user to MongoDB:', error);
  }
}

module.exports = {
  userJoin,
  currentUser,
  userLeave,
  saveUserToMongoDB,
};
