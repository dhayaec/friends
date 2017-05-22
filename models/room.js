const mongoose = require('mongoose');


const UserSchema = mongoose.Schema({
  userId: mongoose.Schema.ObjectId,
  members: [{ type: mongoose.Schema.ObjectId }],
});


const Room = (module.exports = mongoose.model('Room', UserSchema));

module.exports.getMembers = function (id, callback) {
  const query = { _id: id };
  Room.find(query, callback);
};

module.exports.createRoom = function (members, userId, callback) {
  const room = new Room({ userId, members });
  room.save(callback);
};
