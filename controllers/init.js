/*
 * Initialization operations.
 */

var db = require('../dbConnection').dbConnection;

exports.initController = {
  root: function(req, res) {
    res.render('index', {
      title: 'soundmap'
    });
  },

  initialize: function(req, res) {
    console.log('api info:', db.SOUNDMAP_CLIENT_ID, db.SOUNDMAP_REDIRECT_URI);
    res.end(JSON.stringify({
      client_id: db.SOUNDMAP_CLIENT_ID,
      redirect_uri: db.SOUNDMAP_REDIRECT_URI
    }));
  }
};