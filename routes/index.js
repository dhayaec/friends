const express = require('express');
const User = require('../models/user');
const Room = require('../models/room');

const router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'You are not logged in');
  return res.redirect('/users/login');
}

router.get('/', ensureAuthenticated, (req, res) => {
  const { q } = req.query;

  if (q) {
    User.searchUsers(q, req.user._id, (err, users) => {
      console.log(users);
      res.render('index', { users, user: req.user });
    });
  } else {
    User.getUserById(req.user._id, (err, result) => {
      const { notification, friends } = result;
      User.getUserList(friends, (err, userslist) => {
        res.render('index', {
          user: req.user,
          notification,
          friends: userslist,
        });
      });
    });
  }
});

router.get('/addfriend/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;
  User.addNotification(id, _id, (err, user) => {
    res.json({ success: true, user });
  });
});

router.get('/notification', ensureAuthenticated, (req, res) => {
  User.getUserById(req.user._id, (err, result) => {
    const { notification } = result;
    User.getUserList(notification, (err, users) => {
      res.render('notification', { users });
    });
  });
});

router.get('/accept/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;
  User.removeNotification(id, _id, (err, result) => {
    User.addFriend(id, _id, (err, resp) => {
      User.addFriend(_id, id, err => {
        res.redirect('/');
      });
    });
  });
});

router.get('/block/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;
  User.removeNotification(id, _id, (err, result) => {
    User.addToBlocked(id, _id, err => {
      res.redirect('/');
    });
  });
});

router.get('/createroom', ensureAuthenticated, (req, res) => {
  User.getUserById(req.user._id, (err, result) => {
    const { notification, friends } = result;
    User.getUserList(friends, (err, userslist) => {
      res.render('createroom', {
        user: req.user,
        notification,
        friends: userslist,
      });
    });
  });
});

router.get('/chat/:id', ensureAuthenticated, (req, res) => {
  User.getUserById(req.user._id, (err, result) => {
    const { notification } = result;
    res.render('chat', { user: req.user, notification });
  });
});

router.post('/createroom', ensureAuthenticated, (req, res) => {
  const { friends } = req.body;
  Room.createRoom(friends, req.user._id, (err, result) => {
    res.redirect(`/chat/${result._id}`);
  });
});

module.exports = router;
