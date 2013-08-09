
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  controller = new require('./app/controllers/index'),
  users = require('./app/controllers/users.js'),
  rooms = require('./routes/room'),
  http = require('http'),
  path = require('path'),
  mysql = require('mysql'),
  dbConnection = require('./dbConnection').dbConnection;

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

// db.prototype.easyQuery = function() {
//   console.log('easy query');
// };

app.get('/', routes.index);

app.get('/join', rooms.room);

app.get('/login', function(req, res) {
  // Update the user's last_login field
  var user = req.query.user;
  var scid = req.query.scid;
  if (user && scid) {
    db.query("UPDATE users SET last_login = NOW() WHERE username = '" + user + "' AND sc_id = " + scid, function(err, results) {
      if (err) {
        res.end();
      }
      res.end();
    });
  }
});

app.get('/find', function(req, res) {
  // Locate a user in the local database with the username and id from the Soundcloud api
  var username = req.query.username;
  var scid = req.query.scid;
  if (username && scid) {
    var sql = "SELECT id, username FROM users WHERE username = '" + username + "' AND sc_id = " + scid;
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
  }
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
  var sql = "SELECT event_point FROM likes WHERE track_id = " + req.params.id + " ORDER BY event_point";
  db.query(sql, function(err, results) {
    if (err) {
      console.log(err, sql);
      res.end(JSON.stringify(false));
    } else {
      console.log(sql, results);
      var container = [];
      for (var i = 0; i < results.length; i += 1) {
        container.push(results[i].event_point);
      }
      // var output = {
      //   event_points: container
      // };
      // console.log('output', output);
      res.end(JSON.stringify({ event_points: container }));
    }
  })
});

app.post('/likesong', function(req, res) {
  var data = res.req.body;
  console.log('POST Body: ', data);
  var sql = '';

  // Has this song been liked before? If not, we need to capture it
  sql = "SELECT id FROM artists WHERE sc_artist_id = " + data.artistId;
  db.query(sql, function(err, results) {
    if (err) {
      console.log(err, sql);
      res.end(JSON.stringify(false));
    }
    if (results.length === 0) {
      // Newly voted song, add it to the artists and tracks tables
      sql = "INSERT INTO artists(sc_artist_id, artist_name) VALUES(" + data.artistId + ", '" + data.artist + "')";
      db.query(sql, function(err, results) {
        if (err) {
          console.log(err, sql);
          res.end(JSON.stringify(false));
        }
        console.log('New artist added!', sql);
        sql = "INSERT INTO tracks(sc_track_id, sc_artist_id, track_title, uri, permalink_url, genre, label_name, bpm)\
          VALUES(" + data.trackId + ", " + data.artistId + ", '" + data.trackTitle + "', '" + data.uri + "', '" + data.permalinkUrl + "', '" + data.genre.replace(/\'/g, "") + "', '" + data.label + "', '" + data.bpm + "')";
        db.query(sql, function(err, results) {
          if (err) {
            console.log(err, sql);
            res.end(JSON.stringify(false));
          }
          console.log('New track added! ', sql);
        });
      });
    }
  });

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

app.get('/heatmap/:songid/:duration', function(req, res) {
  if (req.params.songid !== undefined && req.params.duration !== undefined) {
    var sql = "SELECT FLOOR(event_point / 1000) AS second_blocks, COUNT(event_point) AS count\
      FROM likes\
      WHERE track_id = " + req.params.songid + "\
      GROUP BY second_blocks\
      ORDER BY second_blocks";

    // Initialize a timespan array with zeros
    var secondBlocks = Math.round(req.params.duration / 1000);
    var timespan = new Array(secondBlocks);
    while (--secondBlocks >= 0) {
      timespan[secondBlocks] = 0;
    }

    db.query(sql, function(err, results) {
      if (err) {
        console.log(err, sql);
        res.end(JSON.stringify(results));
      }
      console.log(results);
      var rootPoint = 0, rootValue = 0;
      for (var i = 0; i < results.length; i += 1) {
        rootPoint = results[i].second_blocks - 1;
        // Heat mark the center point
        timespan[rootPoint] += results[i].count;
        rootValue = timespan[rootPoint];
        // // Heat mark the points to the left and right of the center point
        // if (timespan[rootPoint - 1] !== undefined) {
        //   timespan[rootPoint - 1] += Math.floor(rootValue / 2);
        // }
        // if (timespan[rootPoint + 1] !== undefined) {
        //   timespan[rootPoint + 1] += Math.floor(rootValue / 2);
        // }
        // // // Heat mark the outer points to the left and right of the center point
        // if (timespan[rootPoint - 2] !== undefined) {
        //   timespan[rootPoint - 2] += Math.floor(rootValue / 4);
        // }
        // if (timespan[rootPoint + 2] !== undefined) {
        //   timespan[rootPoint + 2] += Math.floor(rootValue / 4);
        // }
        // Heat mark the points to the left and right of the center point
        if (timespan[rootPoint - 1] !== undefined) {
          timespan[rootPoint - 1] += rootValue;
        }
        if (timespan[rootPoint + 1] !== undefined) {
          timespan[rootPoint + 1] += rootValue;
        }
        // Heat mark the outer points to the left and right of the center point
        if (timespan[rootPoint - 2] !== undefined) {
          timespan[rootPoint - 2] += Math.floor(rootValue / 2);
        }
        if (timespan[rootPoint + 2] !== undefined) {
          timespan[rootPoint + 2] += Math.floor(rootValue / 2);
        }
        // asdf
        if (timespan[rootPoint - 3] !== undefined) {
          timespan[rootPoint - 3] += Math.floor(rootValue / 2);
        }
        if (timespan[rootPoint + 3] !== undefined) {
          timespan[rootPoint + 3] += Math.floor(rootValue / 2);
        }
        // asdf
        if (timespan[rootPoint - 4] !== undefined) {
          timespan[rootPoint - 4] += Math.floor(rootValue / 4);
        }
        if (timespan[rootPoint + 4] !== undefined) {
          timespan[rootPoint + 4] += Math.floor(rootValue / 4);
        }
        // asdf
        if (timespan[rootPoint - 5] !== undefined) {
          timespan[rootPoint - 5] += Math.floor(rootValue / 4);
        }
        if (timespan[rootPoint + 5] !== undefined) {
          timespan[rootPoint + 5] += Math.floor(rootValue / 4);
        }
      }
      // console.log(timespan);
      // for (var i = 0; i < results.length; i += 1) {
      //   timespan[results[i].second_blocks] = results[i].count;
      // }
      res.end(JSON.stringify(timespan));
    });
  } else {
    res.end(JSON.stringify(false));
  }
});

app.get('/heatmap2/:songid', function(req, res) {
  var sql = "SELECT FLOOR(event_point / 1000) AS second_blocks FROM likes WHERE track_id = " + req.params.songid + " ORDER BY second_blocks";
  db.query(sql, function(err, results) {
    if (err) {
      res.end(JSON.stringify(false));
    }
    var output = [];
    for (var i = 0; i < results.length; i += 1) {
      output.push(results[i].second_blocks);
    }
    res.end(JSON.stringify(output));
  });
})

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

app.post('/hostroom', function(req, res) {
  var data = res.req.body;
  console.log(data);
  if (data.userId !== undefined && data.lat !== undefined && data.lon !== undefined) {
    var sql = "INSERT INTO broadcast(user_id, user_lat, user_lon, active) VALUES(" + data.userId + ", " + data.lat + ", " + data.lon + ", 1)";
    db.query(sql, function(err, results) {
      if (err) {
        console.log(err, sql);
        res.end(JSON.stringify(false));
      }
      res.end(JSON.stringify(true));
    });
  }
});

app.get('/broadcasts', function(req, res) {
  var sql = "SELECT broadcast.id AS broadcast_id, users.username, broadcast.user_id, broadcast.user_lat, broadcast.user_lon, broadcast.date_created FROM\
    users RIGHT JOIN broadcast ON users.id = broadcast.user_id\
    WHERE broadcast.active = TRUE\
    ORDER BY broadcast.date_created DESC;";
  db.query(sql, function(err, results) {
    if (err) {
      console.log(err, sql);
      res.end(JSON.stringify(false));
    }
    res.end(JSON.stringify(results));
  });
});

app.get('/core', function(req, res) {
  console.log(controller.controller().test());
  res.end();
  // console.log(controller.core.test());
  // controller.test(req, res);
});

app.get('/test', users.operations);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

