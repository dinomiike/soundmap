
/*
 * All operations related to users.
 */
var mysql = require('mysql');
var dbConnection = require('../../dbConnection').dbConnection;
var db = mysql.createConnection(dbConnection);

db.connect();

exports.userController = {
  login: function(req, res) {
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
  },

  find: function(req, res) {
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
  },

  create: function(req, res) {
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
  },

  authenticate: function(req, res) {
    console.log(process.env);
    console.log(process.env.SOUNDCLOUD_CLIENT_ID);
    console.log(process.env.SOUNDCLOUD_REDIRECT_URL);
    res.end();
  }
};

// var UserController = function() {
//   this.testAction = function(req, res) {
//     console.log('inside the test action function');
//     res.end();
//   }
//   this.otherAction = function(req, res) {
//     console.log('inside the other action function');
//     res.end();
//   }
// };

// exports.userController = new UserController;
