
/*
 * All operations related to songs.
 */
var mysql = require('mysql');
var dbConnection = require('../../dbConnection').dbConnection;
var db = mysql.createConnection(dbConnection);

db.connect();

exports.popularController = {
  exports
};