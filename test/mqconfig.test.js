/*global describe it before after */
var assert = require('assert')
  , should = require('should');
  
  
var Mqc = require('../lib/mq/mqconfig');
var mqc = new Mqc();



describe("MQ Config", function(){
  before(function(done){
    mqc.on('connect', function(){
      done();
    });
  });
  
  after(function(){
    mqc.end();
  });
  
  it("set", function(){
    var driver='testdriver';
    var id="1234";
    var key = "alias";
    var value = "outdoor/temperature";
    key = [driver, id, key].join(':');
    mqc.set(key, value);
  });
  
  it("get", function(done){
    setTimeout(function(){
      var result = mqc.get('testdriver:1234');    
      should.exist(result);
      result.should.include({alias:'outdoor/temperature'});
      done();
    }, 1000);
    
  });
  
  it("should deliver full tree", function(){
    var result = mqc.get();
    should.exist(result);
    result.should.have.property('testdriver');
  });
});