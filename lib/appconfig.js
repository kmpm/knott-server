
var nconf = require('nconf');


nconf.argv()
  .env()
  .file({file: 'knott.conf'});

nconf.defaults({
  process:{title:'knott-server'},
  mqtt:{
    server:'test.mosquitto.org',
    port:1883,
    prefix:'knott'
  },
  log: {
    level: 'DEBUG'}
});


module.exports=nconf;