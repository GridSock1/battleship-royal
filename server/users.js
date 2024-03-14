const { User } = require('./User.js');

const users = [];

function userJoin(id, username, color, userShips) {
  // const user = { id, username, color };
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

module.exports = {
  userJoin,
  currentUser,
  userLeave,
};
