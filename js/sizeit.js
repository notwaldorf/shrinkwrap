$(function() {
    $( "[id^='column-']" ).sortable({
      connectWith: ".draggable",
      items: 'li:not(.column-title)',
      opacity: 0.6,
      placeholder: 'ghost',
      forcePlaceholderSize: true,
      'start': function(event, ui) {
      	// for some reason the placeholder style isn't actually applied
      	ui.placeholder.css("background-color", "#b5d7d5");
      	ui.placeholder.css("border", "none")
      }

    }).disableSelection();
  });

