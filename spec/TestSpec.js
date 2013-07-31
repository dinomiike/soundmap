var mysql = require('mysql');
var request = require('request');

describe('Soundmap web server', function() {
  it('should pass', function() {
    expect(1+2).toEqual(3);
  });

  it('should find the test user', function() {
    var found = '';
    request({
      method: 'GET',
      uri: 'http://localhost:3000/find/testuser/12345'
    },
    function(err, res, body) {
      if (err) console.log(err);
      found = body;
      expect(found).toEqual(true);
    });
  })
});
