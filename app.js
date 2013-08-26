var express = require('express');
var http = require('http');

var app = express();

require('./config/middleware')(app);
// require('./config/environments')(app);
// require('./config/database')(app);
require('./routes')(app);
// var init = require('./app/controllers/init.js');
// var users = require('./app/controllers/users.js');
// var songs = require('./app/controllers/songs');
// var popular = require('./app/controllers/popular.js');
// var host = require('./app/controllers/host.js');
// var rooms = require('./routes/room');
// var path = require('path');







http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

