
var page={};
$(document).ready(function(){
  listenSocket();
  $('.raw-delete').click(deleteHandler);
});

function deleteHandler(e){
  e.preventDefault();
  var $this=$(this);
  var name = $this.data('topic');
  var row = $this.closest('tr');
  page.socket.emit('raw-delete', {name:name});
  row.remove();
}

function setValue(id, nv) {
  var cell = $('#' + id + ' .raw-value');
  var icon="icon-arrow-right";
  var fn=parseFloat(nv), fc = parseFloat(cell.html());
  if (fn > fc){
    icon="icon-arrow-up";
  }
  else if (fn < fc){
    icon="icon-arrow-down";
  }
  //set trend
  $('#' + id + ' .trend').attr('class', 'trend ' + icon);
  $('#' + id + ' .refresh-at').html(toTime(new Date()));
  //set value
  cell.html(Math.round(fn*10)/10);

}

function toTime (date) {
  return date.getHours()+1 + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function listenSocket(){
  var socket = io.connect('/raw');
  page.socket = socket;
  socket.on('raw-changed', function(data){
    var id = topic2id(data.topic);
    var p = $('#' + id );
    if(p.length == 0){
      var rowdata = '<tr id="' + id + '"><td class="topic">' + data.topic + '</td>'
        + '<td class="refresh-at">&nbsp;</td><td>' + data.payload + '</td>'
        + '<td><i class="icon-pause trend"></i></td>'
        + '<td><a class="raw-delete" data-topic="' + id + '" href="#"><i class="icon-trash"></i></a></td>'
        + '</tr>\n';
      $('#raw table').append(rowdata);
    }
    else {
      setValue(id, data.payload);

    }
  });
}
