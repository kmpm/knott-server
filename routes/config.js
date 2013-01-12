var util = require('util')
  ,  Mq = require('../lib/mq');

var config={};

var mq = new Mq();
function getConfig(configio) {
  mq.on('ready', mq.connect);
  mq.on('connected', function(){
    mq.subscribe('/config/#');
  });
  mq.on('data', function(packet) {
    //console.log(packet);
    var adf = packet.topic.split('/');
    var n = config;
    for(var i=2; i<adf.length-1; i++){
      if(!n.hasOwnProperty(adf[i])){
        n[adf[i]]={};
      }
      n = n[adf[i]];
    }
    n[adf[adf.length-1]]=packet.payload;
    //console.log(">>>", util.inspect(config, false, null));

    
    var em = {topic:packet.topic, payload:packet.payload, name:adf.slice(2).join('_')};
    configio.clients().forEach(function(c){
      c.emit('config-changed', em);
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
        mq.publish({topic:topic, payload:data.value});
      });
    });

  getConfig(configio);
  
  app.locals.config=config;
  
  app.get(prefix, function(req, res){
    res.render('config'); 
  });
};
