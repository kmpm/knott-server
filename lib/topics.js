
var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , Mq = require('./mq') 
  , log = require('./log');

var Topics = module.exports = function(){
  this.topics={};
  var self = this;
  this.mq=new Mq();
  this.mq.on('ready', function(){
    log.debug("Topic Ready");
    self.emit('ready');
  });
  this.mq.on('data', function(packet){
    if(packet.payload.length >0){ 
      self._set(packet.topic, packet.payload);
      self.emit('changed', {topic:packet.topic, payload:packet.payload, name:self.getName(packet.topic)});
    }
    else{
      log.debug("got empty packet");
      self._remove(packet.topic);
      self.emit('removed', {topic:packet.topic, name:self.getName(packet.topic)});
    }
  });
}

util.inherits(Topics, EventEmitter);

Topics.prototype.subscribe = function(topic){
  this.mq.subscribe(topic);
  log.debug("subscribing", topic);
};


Topics.prototype.getName = function(topic){
  var name =  topic.split('/').splice(1).join('_');
  name = name.replace('.', '__');
  return name;
}

Topics.prototype.getTopic = function(name) {
  if(name[0] !== '_' ) name = '_' + name;
  name=name.replace('__', '.');
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
  log.debug("remove", topic);
  var key, t = this.get(topic);
  if(typeof(t) === 'object'){
    for(key in t){
      if (t.hasOwnProperty(key)) {
        this.remove(topic + "/" + key);
      }
    }
  }
  this._remove(topic);
  this.mq.publish({topic:topic});
}

/*
 * Just remove. For internal use
 */
Topics.prototype._remove = function(topic){
  log.debug("_remove", topic);
  var parts = topic.split('/');
  var n = this.topics;
  var key;
  for (var i=1; i<parts.length; i++) {
    key=parts[i];
    if(n.hasOwnProperty(key)){
      if(typeof(n[key]) === 'object'){
        log.debug(key, "is object");
        n=n[key];
      }
      else{
        log.debug("deleteing", key);
        delete n[key];
      }
    }
    else{
      log.debug("no such property", key, "in" , n);
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
      return undefined;
    }
  }
  return n;
};

Topics.prototype.flatten = function(data, root){
  var topic, key, key2, value, values = {}; 
  root=root || '';
  for(key in data){
    topic=root + "/" + key;
    if(data.hasOwnProperty(key)) {
      if (typeof data[key] === 'object') {
        value = this.flatten(data[key], topic);
        for(key2 in value){
          if(value.hasOwnProperty(key2)){
            values[key2] = value[key2];
          }
        }
      }
      else {
        values[topic]= data[key];
      }
    }
  }
  return values
};
