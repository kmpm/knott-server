
var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , Mq = require('./mq');

var Topics = module.exports = function(){
  this.topics={};
  var self = this;
  this.mq=new Mq();
  this.mq.on('ready', function(){
    console.log("mq ready");
    self.emit('ready');
  });
  this.mq.on('data', function(packet){
    if(packet.payload.length >0){ 
      self._set(packet.topic, packet.payload);
      self.emit('changed', {topic:packet.topic, payload:packet.payload, name:self.getName(packet.topic)});
    }
    else{
      self._remove(packet.topic);
      self.emit('removed', {topic:packet.topic, name:self.getName(packet.topic)});
    }
  });
}

util.inherits(Topics, EventEmitter);

Topics.prototype.subscribe = function(topic){
  this.mq.subscribe(topic);
  console.log("subscribing", topic);
};


Topics.prototype.getName = function(topic){
  return topic.split('/').splice(1).join('_');
}

Topics.prototype.getTopic = function(name) {
  if(name[0] !== '_' ) name = '_' + name;
  return name.split('_').join('/');
}

Topics.prototype.set = function(topic, payload){
  this._set(topic, payload);
  this.mq.publish({topic:topic, payload:payload});
}

Topics.prototype._set = function(topic, payload){
  var parts = topic.split('/');
  var n = this.topics;
  var key;
  //topic begins with slash so index 0 is empty
  for(var i = 1; i<parts.length-1; i++){
    key = parts[i];
    if(! n.hasOwnProperty(key)){
      n[key]={};
    }
    n = n[key];
  }
  n[parts[parts.length-1]]=payload.toString();
};

/*
 * Remove and publish
 */
Topics.prototype.remove = function(topic){  
  this._remove(topic);
  this.mq.publish({topic:topic});
}
/*
 * Just remove. For internal use
 */
Topics.prototype._remove = function(topic){
  var parts = topic.split('/');
  var n = this.topics;
  var key;
  for(var i=1; i<parts.length; i++){
    key=parts[i];
    if(n.hasOwnProperty(key)){
      if(typeof(n[key]) === 'object'){
        n=n[key];
      }
      else{
        delete n[key];
      }
    }
  }
}
Topics.prototype.get = function(topic){
  var parts = topic.split('/');
  var n = this.topics;
  var key;
  for(var i=1; i<parts.length; i++){
    key=parts[i];
    if(n.hasOwnProperty(key)){
      n=n[key];
    }
    else{
      return null;
    }
  }
  return n;
}
