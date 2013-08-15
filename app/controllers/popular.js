
/*
 * All operations related to songs.
 */
var mysql = require('mysql');
var dbConnection = require('../../dbConnection').dbConnection;
var db = mysql.createConnection(dbConnection);

db.connect();

exports.popularController = {
  popularContent: function(req, res) {
    sql = "SELECT COUNT(likes.track_id) AS like_count, likes.track_id, artists.artist_name, tracks.track_title, tracks.permalink_url, tracks.artwork_url\
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
  },

  recentContent: function(req, res) {
    sql = "SELECT users.username, users.avatar_url, likes.track_id, likes.user_id, DATE_FORMAT(likes.date_set, '%m-%d-%Y %H:%i') AS date_set, tracks.track_title, tracks.uri, tracks.genre\
      FROM users RIGHT JOIN likes ON users.id = likes.user_id\
      INNER JOIN tracks ON likes.track_id = tracks.sc_track_id\
      ORDER BY date_set DESC\
      LIMIT 5;"
    db.query(sql, function(err, results) {
      if (err) {
        console.log(err, sql);
        res.end(JSON.stringify(false));
      }
      res.end(JSON.stringify(results));
    })
  }
};