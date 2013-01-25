

var assert = require('assert')
  , should = require('should');


var Topics = require('../lib/topics');


describe('Topics', function(){
  var t = new Topics();
  it("getName", function(){
    var result = t.getName('/config/owfs/10.1231441/alias');
    result.should.equal('config_owfs_10.1231441_alias');
  });

  it("getTopic", function(){
    var result = t.getTopic('config_owfs_10.1231441_alias');
    result.should.equal('/config/owfs/10.1231441/alias');
  });
  describe("subscriptions", function(){
    var t = new Topics();
    it("should have subscribe", function(done) {
      t.subscribe("/config/#");
      var callIt=true
      t.on('changed', function(options){
        if (callIt){
          callIt=false;
          done();
        }
      });
    });
  });

});

describe("Topics - setting", function(){
  before(function(done){
    var t = new Topics();
    this.t = t;
    t.on('ready', function(){
      done();
    });
  });
  
  it("should have subscribe", function(done) {
    this.t.subscribe("/test/#");
    setTimeout(done, 1500);
  });

  it("should be possible to set and get back results", function(done){
    this.t.set('/test/value1', (new Date()).toString());
    this.t.on('changed', function(options){
      options.should.have.property('topic');
      options.should.have.property('payload');
      options.should.have.property('name');
      done();
    });
  });
});
