
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
  db.query("UPDATE users SET last_login = NOW() WHERE username = '" + req.params.user + "' AND sc_id = " + req.params.scid, function(err, results) {
    if (err) {
      res.end();
    }
    res.end('ok');
  });
});

app.get('/find/:user/:scid', function(req, res) {
  // Locate a user in the local database with the username and id from the Soundcloud api
  var sql = "SELECT id, username FROM users WHERE username = '" + req.params.user + "' AND sc_id = " + req.params.scid;
  console.log(sql);
  db.query(sql, function(err, results) {
    if (err) {
      // User not found
      console.log(err);
      res.end(JSON.stringify(false));
    } else {
      if (results.length > 0) {
        console.log('found the user');
        console.log(results);
        res.end(JSON.stringify(true));
      } else {
        res.end(JSON.stringify(false));
      }
    }
  });
});

app.post('/create', function(req, res) {
  console.log(res.req.body);
  var data = res.req.body;
  var sql = "INSERT INTO users(sc_id, username, permalink, avatar_url, country, full_name, city, last_login) VALUES(" + data.sc_id + ", '" + data.username + "', '" + data.permalink + "', '" + data.avatar_url + "', '" + data.country + "', '" + data.full_name + "', '" + data.city + "', NOW())";
  db.query(sql, function(err, results) {
    if (err) {
      console.log(err);
      console.log(sql);
      res.end(JSON.stringify(false));
    } else {
      console.log(sql);
      res.end(JSON.stringify(true));
    }
  });
});

app.get('/likes/:id', function(req, res) {
  var sql = "SELECT event_point FROM likes WHERE track_id = " + req.params.id;
  db.query(sql, function(err, results) {
    if (err) {
      console.log(err, sql);
      res.end(JSON.stringify(false));
    } else {
      console.log(sql);
      console.log(results);
      var container = [];
      for (var i = 0; i < results.length; i += 1) {
        container.push(results[i].event_point);
      }
      var output = {
        event_points: container
      };
      console.log('output', output);
      res.end(JSON.stringify(output));
    }
  })
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

