

var mqtt = require('mqtt'),
  appconfig = require('../appconfig'),
  util = require('util'),
  nconf = require('nconf'),
  EventEmitter = require('events').EventEmitter;
 
  
  
  
  
var MqConfig = module.exports = function() {
  var self = this;
  this.connected = false;
  this.config = new nconf.Provider();
  this.config.file({file:'mqconfig.conf'});
  this.client = mqtt.createClient(appconfig.get('mqtt:port'), appconfig.get('mqtt:server'));
  this.prefix = appconfig.get('mqtt:prefix');
   
  this.client.on('connect', function(){
    var subtopic = util.format('%s/config/#', self.prefix);
    self.connected=true;
    self.client.subscribe(subtopic, function(){      
      self.emit('connect');
    });
  });
   

  this.client.on('message', function(topic, message, packet){
    topic = topic.replace(self.prefix + '/', '');
    topic = topic.replace('config/', '');
    var key = topic.replace(/\//g, ':');
    self.config.set(key, message);
    self.emit('changed', key, message);
  });
};

util.inherits(MqConfig, EventEmitter);

MqConfig.prototype.end = function(){
  this.config.save();
  this.client.end();
}

MqConfig.prototype.remove = function(key, callback){
  this.set(key, null, callback)
}

MqConfig.prototype.get = function(key) {
  return this.config.get(key);
}


MqConfig.prototype.set = function(key, value, callback) {
  var topic = util.format('%s/config/%s', this.prefix, key.replace(/:/g, '/'));
  callback = callback || console.log;
  this.client.publish(topic, value, {retain:1}, callback);
}
