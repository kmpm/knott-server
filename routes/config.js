var util = require('util')
  , Topics = require('../lib/topics');

var config=new Topics();

function getConfig(configio) {
  config.on('ready', function(){
    config.subscribe('/config/#');
  });
  config.on('changed', function(packet) {
    configio.clients().forEach(function(c){
      c.emit('config-changed', packet);
    });
  });
  config.on('removed', function(packet){
    configio.clients().forEach(function(c){
      c.emit('config-removed', packet);
    });
  });
}

module.exports =  Routes = function(app, io) {
  var prefix = '/config';
  var configio = io
    .of(prefix)
    .on('connection', function(socket){
      console.log('socket.io connected');
      socket.on('config-update', function(data){
        var topic = '/config/' + data.name.split('_').join('/');
        config.set(topic, data.value);
      });
      socket.on('config-delete', function(data){
        var topic = '/config/' + data.name.split('_').join('/');
        config.remove(topic);
      });
    });

  getConfig(configio);
  
  //app.locals.config=config.topics.config;
  
  app.get(prefix, function(req, res){
    console.log(util.inspect(config.get('/config'), false, null));
    res.render('config', {config:config.get('/config')}); 
  });
};
