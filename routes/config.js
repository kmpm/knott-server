var util = require('util'),
  mq = require('../lib/mq');



var Routes = module.exports = function(app, io) {
  var prefix = '/config';
  var configio = io
    .of(prefix)
    .on('connection', function(socket){
      console.log('socket.io connected');
      socket.on('config-update', function(data){
        console.log("web is trying to update", data.key , "to", data.value);
        mq.config.set(data.key, data.value);
      });
      socket.on('config-delete', function(data){
        console.log("web is trying to remove", data.key);
        mq.config.remove(data.key);
      });
    });

  mq.config.on('changed', function(key, value) {
    var payload = {key:key, value:value};
    configio.clients().forEach(function(c){
      c.emit('config-changed', payload);
    });
  });
  
  mq.config.on('removed', function(key){
    var payload = {key:key};
    configio.clients().forEach(function(c){
      c.emit('config-removed', payload);
    });
  });
  
  //app.locals.config=config.topics.config;
  
  app.get(prefix, function(req, res){
    var configdata = mq.config.get() || {};
    console.log("full config=", util.inspect(configdata, false, null));
    res.render('config', {config:configdata}); 
  });
};
