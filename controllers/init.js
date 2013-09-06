/*
 * Initialization operations.
 */

exports.initController = {
  root: function(req, res) {
    res.render('index', {
      title: 'soundmap'
    });
  },

  initialize: function(req, res) {
    console.log('inside initialize:', process.env.SOUNDMAP_CLIENT_ID, process.env.SOUNDMAP_REDIRECT_URI);
    res.end(JSON.stringify({
      client_id: process.env.SOUNDMAP_CLIENT_ID,
      redirect_uri: process.env.SOUNDMAP_REDIRECT_URI
    }));
  }
};