
var util = require('util')
  ,  Mq = require('../lib/mq');


var raw = {};
function initMq(myio) {
  var mq = new Mq();
  mq.on('ready', mq.connect);
  mq.on('connected', function(){
    mq.subscribe('/raw/#');
  });
  mq.on('data', function(packet){
    //console.log("raw data", packet.topic, packet.payload);
    myio.clients().forEach(function(c){
      c.emit('raw-changed', {topic:packet.topic, payload:packet.payload});
      raw[packet.topic]={at:new Date(), value:packet.payload};
    });
  });
  return mq;
}

module.exports = Routes = function(app,io) {
  var mq;
  var prefix = '/raw';
  var myio = io
    .of(prefix)
    .on('connection', function(socket){
      console.log("connected");
    });
  
  mq = initMq(myio);

  app.get(prefix, function(req, res) {
    res.render('raw', {values:raw});  
  });
};


