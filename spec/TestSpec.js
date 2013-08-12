var mysql = require('mysql');
var request = require('request');

var dbConnection = require('../dbConnection').dbConnection;
var db = mysql.createConnection(dbConnection);

describe('soundmap web server', function() {

  it('should find the test user', function() {
    var found = '';
    request({
      method: 'GET',
      uri: 'http://localhost:3000/find/?user=testuser&scid=12345'
    },
    function(err, res, body) {
      console.log('res: ' + res);
      console.log('body: ' + body);
      if (err) console.log(err);
      found = body;
      expect(found).toEqual(true);
    });
  });

  it('should update the user on login', function() {
    var currentLogin = '';
    db.query("SELECT last_login FROM users WHERE id = 1", function(err, results) {
      if (err) console.log(err);
      currentLogin = results.last_login;
      console.log(currentLogin);
      // request({
      //   method: 'GET',
      //   uri: '/login?user=1&scid=12345'
      // },
      // function(err, res, body) {
      //   if (err) console.log(err);
      //   console.log(body);
      // });
    });
  });
});
