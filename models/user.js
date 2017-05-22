const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const UserSchema = mongoose.Schema({
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  gender: {
    type: String,
  },
  friends: [{ type: mongoose.Schema.ObjectId }],
  notification: [{ type: mongoose.Schema.ObjectId }],
  blocked: [{ type: mongoose.Schema.ObjectId }],
});

const User = (module.exports = mongoose.model('User', UserSchema));

module.exports.createUser = function (newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.getUserByUsername = function (email, callback) {
  const query = { email };
  User.findOne(query, callback);
};

module.exports.getUserById = function (id, callback) {
  User.findById(id, callback);
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
  console.log(candidatePassword);
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
};

module.exports.searchUsers = function (q, userId, callback) {
  console.log(userId);
  const query = { $or: [{ firstname: q }, { lastname: q }], blocked: { $nin: [userId] } };
  User.find(query, callback);
};

module.exports.addNotification = function (id, loggedUser, callback) {
  const query = { _id: id };
  User.update(query, { $push: { notification: loggedUser } }, callback);
};

module.exports.addFriend = function (id, loggedUser, callback) {
  const query = { _id: id };
  User.update(query, { $push: { friends: loggedUser } }, callback);
};

module.exports.addToBlocked = function (id, loggedUser, callback) {
  const query = { _id: loggedUser };
  User.update(query, { $push: { blocked: id } }, callback);
};

module.exports.getUserList = function (ids, callback) {
  const query = { _id: { $in: ids } };
  User.find(query, callback);
};

module.exports.removeNotification = function (id, loggedUser, callback) {
  const query = { _id: loggedUser };
  User.update(query, { $pull: { notification: { $in: [id] } } }, callback);
};
