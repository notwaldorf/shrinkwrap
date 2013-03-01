$(function() {
  // event handlers
  $('#new-card-box').hide();

  $('#add-new-card').click(function(){
    $("#new-card-box").show('fast');
  });
  
  $('#cancel-card').click(function(){
    $('#card-text').val(' ');
    $("#new-card-box").hide('fast');
  });

  function addNewCard() {
    var contents = $('#card-text').val();
    $('#column-nosize').append('<li>'+ contents + '</li>')
    $("#new-card-box").hide('fast');
  }

  $('#save-card').click(addNewCard);
  $('#card-text').keyup(function(e){
    if(e.keyCode == 13)
    {
      addNewCard();
    }
  });


  // drag and drop
  $( "[id^='column-']" ).sortable({
    connectWith: ".draggable",
    items: 'li:not(.no-drag)',
    opacity: 0.6,
    placeholder: 'ghost',
    forcePlaceholderSize: true,
    'start': function(event, ui) {
    	// for some reason the placeholder style isn't actually applied
    	ui.placeholder.css("background-color", "transparent");
      ui.placeholder.css("border-style", "dashed");
    }
  }).disableSelection();
});

