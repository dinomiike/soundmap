
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path'),
  mysql = require('mysql'),
  dbConnection = require('./dbConnection.js').dbConnection;

var db = mysql.createConnection(dbConnection);

var app = express();

db.connect();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/db', function(req, res) {
  db.query('select * from users', function(err, results) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(results));
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

