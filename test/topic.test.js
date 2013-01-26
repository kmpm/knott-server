

var assert = require('assert')
  , should = require('should');


var Topics = require('../lib/topics');


describe('Topics', function(){
  before(function(done){
    var t = new Topics();
    this.t = t;
    t.on('ready', function(){
      done();
    });
  });
  it("getName", function(){
    var result = this.t.getName('/config/owfs/10.1231441/alias');
    result.should.equal('config_owfs_10.1231441_alias');
  });

  it("getTopic", function(){
    var result = this.t.getTopic('config_owfs_10.1231441_alias');
    result.should.equal('/config/owfs/10.1231441/alias');
  });


  it("get missing value", function(){
    var result = this.t.get('/testmissing');
    should.not.exist(result);
  });


  describe("live stuff", function(){
    before(function(){
      this.t.subscribe("/test/#");
    });
    it("should be possible to set and get back results", function(done){
      this.t.set('/test/key/value1', (new Date()).toString());
      this.t.once('changed', function(options){
        options.should.have.property('topic');
        (options.topic).should.equal('/test/key/value1');
        options.should.have.property('payload');
        options.should.have.property('name');
        done();
      });
    });

    it("remove", function(){
      this.t.remove('/test');
    });
  });//live stuff
});
