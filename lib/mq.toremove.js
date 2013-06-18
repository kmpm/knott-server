
/**
 * Module dependencies
 */

var util = require('util')
  , mqtt = require('mqttjs')
  , EventEmitter = require('events').EventEmitter;

var DEBUG=false;
var count =0;
var Mq = module.exports = function(options) {
  this.id = count++;
  this.options = options;
  var self = this;
  mqtt.createClient(1883, '127.0.0.1', function(err, client){
    if(err){
      if(DEBUG) console.log("mqtt %s client creation error, %j", self.id, err);
      process.exit(1);
    }
    self.client = client;
    self.connect(function(){
      self.emit('ready');
    });
  });

};


util.inherits(Mq, EventEmitter);

Mq.prototype.connect = function(callback) {
  //TODO:error on no client
  var client = this.client;
  var self = this;
  client.connect({keepalive:30000});
  client.on('connack', function(packet){
    if(DEBUG) console.log("mqtt %s connected:%j", self.id, packet);
    if(typeof(callback) === 'function') callback();
    self.emit('connected');
  });
  client.on('close', function(){
    if(DEBUG) console.log("mqtt %s closed %j", self.id, arguments);
    self.emit('close');
  });
  client.on('error', function(e){
    if(DEBUG) console.log("mqtt %s error %j", self.id, e);
    self.emit('error', e);
  });
  client.on('publish', function(packet) {
    if(DEBUG) console.log("mqtt %s data", self.id);
    self.emit('data', packet);
  });
  client.on('suback', function(packet) {
    if(DEBUG) console.log("mqtt %s subscribed:%j", self.id, packet);
  });
}

Mq.prototype.subscribe = function(topic) {
  this.client.subscribe({topic:topic});
}

Mq.prototype.publish = function(options) {
  if(!options.hasOwnProperty('retain')){
    options.retain=true;
  }
  this.client.publish(options);
}
