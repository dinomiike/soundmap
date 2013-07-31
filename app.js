
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path'),
  mysql = require('mysql'),
  dbConnection = require('./dbConnection.js').dbConnection;

var db = mysql.createConnection(dbConnection);

var app = express();

db.connect();

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

app.get('/login/:user/:scid', function(req, res) {
  // Update the user's last_login field
  db.query('UPDATE users SET last_login = NOW() WHERE username = ' + req.params.user + ' AND sc_id = ' + req.params.scid, function(err, results) {
    if (err) {
      res.writeHead(500);
      res.end();
    }
    res.writeHead(200);
    res.end('ok');
  });
});

app.get('/find/:user/:scid', function(req, res) {
  // Locate a user in the local database with the username and id from the Soundcloud api
  db.query('SELECT id, username FROM users WHERE username = ' + req.params.user + ' AND sc_id = ' + req.params.scid, function(err, results) {
    if (err) {
      // User not found
      res.writeHead(200);
      res.end(false);
    }
    res.writeHead(200);
    res.end(true);
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

