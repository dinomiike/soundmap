
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  users = require('./app/controllers/users.js'),
  songs = require('./app/controllers/songs'),
  popular = require('./app/controllers/popular.js'),
  host = require('./app/controllers/host.js'),
  rooms = require('./routes/room'),
  http = require('http'),
  path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/join', rooms.room);
// User Operations
app.get('/login', users.userController.login);
app.get('/find', users.userController.find);
app.post('/create', users.userController.create);
// Song Operations
app.get('/likes/:id', songs.songController.likes);
app.post('/likesong', songs.songController.likeSong);
app.get('/heatmap/:songid/:duration', songs.songController.heatMap);
// Popular Content Operations
app.get('/popular', popular.popularController.popularContent);
app.get('/recent', popular.popularController.recentContent);
// Host Tab Operations
app.post('/hostroom', host.hostController.hostSession);
app.get('/broadcasts', host.hostController.broadcasts);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

