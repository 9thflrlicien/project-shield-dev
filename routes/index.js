var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Chatshier' });
});

router.get('/calendar', function(req, res, next) {
  res.render('calendar', { title: 'Chatshier行事曆' });
});

router.get('/chat', function(req, res, next) {
  res.render('chat', { title: 'Chatshier聊天室' });
});

router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: 'Chatshier分析表' });
});

router.get('/tag', function(req, res, next) {
  res.render('tag', { title: 'Chatshier標籤' });
});

router.get('/ticket', function(req, res, next) {
  res.render('ticket', { title: 'Chatshier待辦事項' });
});

router.get('/tform', function(req, res, next) {
  res.render('ticketForm', { title: 'Chatshier表單' });
});

router.get('/setting', function(req, res, next) {
  res.render('setting', { title: '設定' });
});

// 訊息
router.get('/message_overview', function(req, res, next) {
  res.render('message_overview', { title: 'Message Overview' });
});

router.get('/message_addfriendreply', function(req, res, next) {
  res.render('message_addfriendreply', { title: 'Message Add Friend Reply' });
});

//authentication
router.get('/login', function(req, res, next) {
  res.render('login', { title: '登入' });
});
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: '註冊' });
});

module.exports = router;
