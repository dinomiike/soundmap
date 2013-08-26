
/*
 * All operations related to hosting a session.
 */
// var mysql = require('mysql');
// var dbConnection = require('../../dbConnection').dbConnection;
// var db = mysql.createConnection(dbConnection);

// db.connect();

exports.hostController = {
  hostSession: function(req, res) {
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
  },

  broadcasts: function(req, res) {
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
  }
};