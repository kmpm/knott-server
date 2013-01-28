
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , util = require('util')
  , socket = require('socket.io');


var app = express();

process.title="knott-server";

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
  app.locals.pretty = true;
});

app.get('/', routes.index);
app.locals.title = 'knott';

app.locals.id2topic = function (id) {
  if(id[0] !== '_' ) id = '_' + id;
  id=id.replace('__', '.');
  return id.split('_').join('/');
}
app.locals.topic2id = function (/*topic*/) {
  var args=[];
  for(var i=0; i<arguments.length; i++){
    args.push(arguments[i]);
  }
  var topic =  args.join('/').replace('//', '/');
  console.log("topic=", topic);
  var id = topic.split('/').splice(1).join('_');
  return id.replace('.', '__');
}

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


var io = socket.listen(server);
io.set('log level', 1);
require('./routes/config')(app, io);
require('./routes/raw')(app, io);

