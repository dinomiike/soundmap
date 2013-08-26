/*
 * All operations related to users.
 */

var mysql = require('mysql');
var dbConnection = require('../../dbConnection').dbConnection;
var db = mysql.createConnection(dbConnection);
db.connect();

exports.database = {
  execQuery: function(sql, callback) {
    console.log('Executing query:', sql);
    db.query(sql, function(err, results) {
      if (err) {
        console.log(err);
        return false;
      }
      return callback(results);
    });
  }
};