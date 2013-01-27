


function id2topic (id) {
  if(id[0] !== '_' ) id = '_' + id;
  id=id.replace('__', '.');
  return id.split('_').join('/');
}

function topic2id (topic) {
  var id =  topic.split('/').splice(1).join('_');
  return id.replace('.', '__');
}


