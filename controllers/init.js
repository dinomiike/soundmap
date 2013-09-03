/*
 * Initialization operations.
 */

exports.initController = {
  root: function(req, res) {
    console.log('inside the init controller');
    res.render('index', {
      title: 'soundmap'
    });
  },

  initialize: function(req, res) {
    res.json({
      client_id: process.env.SOUNDMAP_CLIENT_ID,
      redirect_uri: process.env.SOUNDMAP_REDIRECT_URI
    });
  }
};