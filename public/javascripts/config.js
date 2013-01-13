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
  $('.config-device').each(function(index){
    bindConfigEvents($(this));  
  });
};

function bindConfigEvents(master){
  master.find('.config-input').change(changedConfigHandler);
  master.find('.config-save').click(saveConfigHandler);
  master.find('.config-add').click(addConfigHandler);
  master.find('.config-delete').click(deleteConfigHandler);

  function deleteConfigHandler(e){
    e.preventDefault();
    var row = $(this).closest('tr')

    var name = row.find('.config-input').eq(0)
      .attr('name');
    page.socket.emit('config-delete', {name:name});
    row.remove();
  }

  function changedConfigHandler(eventObject){
    $input = $(eventObject.currentTarget);
    console.log($input.attr('name'), 'chanaged');
    var $btn = $input.parent().find('.config-save').eq(0);
    $btn.removeClass('hidden');
  }

  function saveConfigHandler(e){
    e.preventDefault();
    var name;
    var row = $(this).closest('tr');
    var $input = row.find('.config-input').eq(0);
    
    if($input.hasClass('config-new')){
      name = row.find('.config-key input').val();
      //remove the input by overwriting
      row.find('.config-key').html(name);
      //prepend to get the full name
      name = master.attr('id') + "_" + name;
      $input.attr('name', name);
      $input.removeClass('config-new');
    }
    else{
      name = $input.attr('name');
    }
  
    var value = $input.val();
    page.socket.emit('config-update', {name:name, value:value});
    $(this).addClass('hidden');
  }

  function addConfigHandler(e) {
    e.preventDefault();
    var data = $('<tr><td class="config-key"><input ></td>'
      + '<td><input class="config-input config-new">'
      + '<a class="btn config-save" href="#"><i class="icon-ok"></i></a></td>'
      + '<td><a class="btn config-delete"><i class="icon-trash"></i></td>'
      + '</tr>');
    data.find('.config-save').click(saveConfigHandler);
    master.find('tbody').append(data);  
  }
}
