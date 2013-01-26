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
        var topic = config.getTopic( data.name );
        console.log("web is trying to update", topic , "to", data.value);
        config.set(topic, data.value);
      });
      socket.on('config-delete', function(data){
        var topic = config.getTopic(data.name);
        console.log("web is trying to remove", topic);
        config.remove(topic);
      });
    });

  getConfig(configio);
  
  //app.locals.config=config.topics.config;
  
  app.get(prefix, function(req, res){
    var configdata = config.get('/config') || {};
    console.log(util.inspect(configdata, false, null));
    res.render('config', {config:configdata}); 
  });
};
