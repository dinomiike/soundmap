
/*
 * All operations related to songs.
 */
// var mysql = require('mysql');
// var dbConnection = require('../../dbConnection').dbConnection;
// var db = mysql.createConnection(dbConnection);

// db.connect();

exports.songController = {
  likes: function(req, res) {
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
        res.end(JSON.stringify({ event_points: container }));
      }
    });
  },

  hasLiked: function(req, res) {
    console.log('hasLiked query params: ', req.query);
    var sql = "SELECT event_point FROM likes WHERE user_id = " + req.query.userid + " AND track_id = " + req.query.trackid;
    db.query(sql, function(err, results) {
      if (err) {
        console.log(err, sql);
        res.end(JSON.stringify(false));
      }
      console.log(sql, results);
      if (results.length > 0) {
        res.end(JSON.stringify(results));
      } else {
        res.end(JSON.stringify(false));
      }
    });
  },

  likeSong: function(req, res) {
    var data = res.req.body;
    var sql = '';

    // Has this artist been liked before? If not, we need to make an entry for them
    sql = "SELECT id FROM artists WHERE sc_artist_id = " + data.artistId;
    db.query(sql, function(err, results) {
      if (err) {
        console.log(err, sql);
        res.end(JSON.stringify(false));
      }
      console.log('search for artist returned: ', results);
      if (results.length === 0) {
        // We don't have a record of this artist; create one
        sql = "INSERT INTO artists(sc_artist_id, artist_name) VALUES(" + data.artistId + ", '" + data.artist + "')";
        db.query(sql, function(err, results) {
          if (err) {
            console.log(err, sql);
            res.end(JSON.stringify(false));
          }
          console.log('New artist added!', sql);
        });
      }
    });

    // Check if we have this track
    sql = "SELECT id FROM tracks WHERE sc_track_id = " + data.trackId;
    db.query(sql, function(err, results) {
      if (err) {
        console.log(err, sql);
        res.end(JSON.stringify(false));
      }
      if (results.length === 0) {
        // We don't have a record of this track; create one
        sql = "INSERT INTO tracks(sc_track_id, sc_artist_id, track_title, uri, permalink_url, artwork_url, genre, label_name, bpm)\
          VALUES(" + data.trackId + ", " + data.artistId + ", '" + data.trackTitle + "', '" + data.uri + "', '" + data.permalinkUrl + "', '" + data.artworkUrl + "', '" + data.genre.replace(/\'/g, "") + "', '" + data.label + "', '" + data.bpm + "')";
        db.query(sql, function(err, results) {
          if (err) {
            console.log(err, sql);
            res.end(JSON.stringify(false));
          }
          console.log('New track added! ', sql);
        });
      }
    });

    // Record the like point
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
  },

  heatMap: function(req, res) {
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
        res.end(JSON.stringify(timespan));
      });
    } else {
      res.end(JSON.stringify(false));
    }
  }
};