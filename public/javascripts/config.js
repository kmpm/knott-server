var page={};

var listenSocket = function() {
  var socket = io.connect('/config');
  page.socket=socket;
  socket.on('config-changed', function(data){
    console.log(data);
    var $input = $('input[name="' + data.name + '"]');
    console.log($input.val(), data.payload);
    if($input.val() !== data.payload){
      $input.val(data.payload);
    }
  });
};

var deviceConfig = function(){
  $('.config-input').change(function(eventObject){
    $input = $(eventObject.currentTarget);
    console.log($input.attr('name'), 'chanaged');
    var $btn = $input.parent().children('button').eq(0);
    $btn.removeClass('hidden');
  });
  $('.controls button').click(function(e){
    e.preventDefault();
    var $input = $(this).parent().children('input').eq(0);
    var name = $input.attr('name');
    var value = $input.val();
    page.socket.emit('config-update', {name:name, value:value});
    $(this).addClass('hidden');
  });
};
