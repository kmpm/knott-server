
var util = require('util')
  , Topics = require('../lib/topics');  

var raw = new Topics();

function initMq(myio) {
  raw.on('ready', function(){
    raw.subscribe('/raw/#');
  });
  raw.on('changed', function(packet){
    myio.clients().forEach(function(c) {
      c.emit('raw-changed', {topic:packet.topic, payload:packet.payload});
    });
  });
  return raw;
}

module.exports = Routes = function(app,io) {
  var mq;
  var prefix = '/raw';
  var myio = io
    .of(prefix)
    .on('connection', function(socket){
      console.log("connected");
      socket.on('raw-delete', function(data){
        var topic = raw.getTopic(data.name);
        console.log("web is trying to remove" , topic);
        raw.remove(topic); 
      });
    });
  
  initMq(myio);

  app.get(prefix, function(req, res) {
    var rawdata = raw.get('/raw') || {}; 
    rawdata = raw.flatten(rawdata, '/raw')
    console.log("rawdata", rawdata);
    res.render('raw', {values:rawdata});  
  });
};


