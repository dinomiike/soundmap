
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

app.get('/find/:username/:scid', function(req, res) {
  // Locate a user in the local database with the username and id from the Soundcloud api
  var sql = "SELECT id, username FROM users WHERE username = '" + req.params.username + "' AND sc_id = " + req.params.scid;
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
        res.end(JSON.stringify(results[0]));
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

app.post('/likesong', function(req, res) {
  var data = res.req.body;
  var sql = '';

  if (data.userId.length > 0 && data.trackId.length > 0 && data.eventPoint.length > 0) {
    // Has this user liked this song before?
    db.query("SELECT track_id FROM likes WHERE track_id = " + data.trackId + " AND user_id = " + data.userId, function(err, results) {
      if (err) {
        console.log(err, sql);
        res.end(JSON.stringify(false));
      }
      console.log(results);
      if (results.length > 0) {
        // This like event should be an update
        sql = "UPDATE likes SET event_point = " + data.eventPoint + " WHERE user_id = " + data.userId + " AND track_id = " + data.trackId;
      } else {
        // This like event should be an insert
        sql = "INSERT INTO likes(user_id, track_id, event_point) VALUES(" + data.userId + ", " + data.trackId + ", " + data.eventPoint + ")";
      }

      db.query(sql, function(err, results) {
        if (err) {
          console.log(err, sql);
          res.end(JSON.stringify(false));
        } else {
          console.log(results, sql);
          res.end(JSON.stringify(true));
        }
      });
    });
  } else {
    console.log('insufficient parameters provided');
    res.end(JSON.stringify(false));
  }
});

app.get('/popular', function(req, res) {
  sql = "SELECT COUNT(likes.track_id) AS like_count, likes.track_id, artists.artist_name, tracks.track_title, tracks.permalink_url\
    FROM likes INNER JOIN tracks ON likes.track_id = tracks.sc_track_id\
    INNER JOIN artists ON tracks.sc_artist_id = artists.sc_artist_id\
    GROUP BY likes.track_id\
    ORDER BY like_count DESC\
    LIMIT 15";
  db.query(sql, function(err, results) {
    if (err) {
      console.log(err, sql);
      res.end(JSON.stringify(false));
    }
    res.end(JSON.stringify(results));
  });
});

app.get('/recent', function(req, res) {
  sql = "SELECT users.username, likes.track_id, likes.user_id, likes.date_set, tracks.track_title, tracks.uri, tracks.genre\
    FROM users RIGHT JOIN likes ON users.id = likes.user_id\
    INNER JOIN tracks ON likes.track_id = tracks.sc_track_id\
    ORDER BY likes.date_set DESC\
    LIMIT 5;"
  db.query(sql, function(err, results) {
    if (err) {
      console.log(err, sql);
      res.end(JSON.stringify(false));
    }
    res.end(JSON.stringify(results));
  })
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

