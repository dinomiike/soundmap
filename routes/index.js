/*
 * All routes.
 */

var init = require('../controllers/init.js');
var users = require('../controllers/users.js');
var songs = require('../controllers/songs');
var popular = require('../controllers/popular.js');
var host = require('../controllers/host.js');
var rooms = require('../routes/room');
var path = require('path');

module.exports = function(app) {
  app.get('/', init.initController.root);
  app.get('/join', rooms.room);
  app.get('/init', init.initController.initialize);
  // User Operations
  app.get('/login', users.userController.login);
  app.get('/find', users.userController.find);
  app.post('/create', users.userController.create);
  app.get('/authenticate', users.userController.authenticate);
  // Song Operations
  app.get('/likes/:id', songs.songController.likes);
  app.post('/likesong', songs.songController.likeSong);
  app.get('/hasliked', songs.songController.hasLiked);
  app.get('/heatmap/:songid/:duration', songs.songController.heatMap);
  // Popular Content Operations
  app.get('/popular', popular.popularController.popularContent);
  app.get('/recent', popular.popularController.recentContent);
  // Host Tab Operations
  app.post('/hostroom', host.hostController.hostSession);
  app.get('/broadcasts', host.hostController.broadcasts);
};