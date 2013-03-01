$(function() {
  var CardSizes = {
                  XS : "xs", 
                  S: "s", 
                  M: "m", 
                  L: "l", 
                  XL: "xl",
                  TO_DO: "todo"
                  };

  var CARD_STORAGE = "sizeit.cards";
  var columns = [
                    '#column-xs',
                    '#column-s',
                    '#column-m',
                    '#column-l',
                    '#column-xl',
                    '#column-todo']

  // ==========================
  // Event handlers
  // ==========================

  $('#new-card-box').hide();

  $('#add-new-card').click(function(){
    $("#new-card-box").show('fast');
    $("#card-text").focus(); 
  });

  $('#clear-cards').click(clearStorage);
  
  $('#cancel-card').click(function(){
    $('#card-text').val('');
    $("#new-card-box").hide('fast');
  });

  $('#save-card').click(addNewCard);

  // ==========================
  // Drag and drop
  // ==========================

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

  // for testing only
  if (localStorage[CARD_STORAGE] == undefined)
    knitFakeSocks();

  loadAllStorage();


  // ==========================
  // Display cards
  // ==========================

  function addNewCard() {
    var contents = $('#card-text').val();
    putSockInDrawer(contents, CardSizes.TO_DO);
    $('#column-todo').append('<li class="card">'+ contents + '</li>');
    $("#new-card-box").hide('fast');
  }

  function displayCards(cards) {
    // first clear everything
    for (var i = 0; i < columns.length; i++) {
      var jCol = $(columns[i]);
      jCol.children().remove(".card");  
    }

    if (cards == null)
      return;

    for (var i = 0; i < cards.length; i++) {
      var jCol = $('#column-' + cards[i].size);
      jCol.append('<li class="card">'+ cards[i].text + '</li>');  
    }
  }

  // ==========================
  // Save and load cards
  // ==========================

  function loadAllStorage() {
    var stored = localStorage[CARD_STORAGE];  

    if (stored == undefined)
      var cards = []
    else
      cards = JSON.parse(stored);

    displayCards(cards);
  }

  function clearStorage() {
    localStorage.removeItem(CARD_STORAGE);  
    displayCards(null);
  }

  function putSockInDrawer(sock, size) {
    var stored = localStorage[CARD_STORAGE];
    if (stored == undefined)
      var cards = []
    else
      cards = JSON.parse(stored);

    cards.push({text: sock, size: size});
    localStorage[CARD_STORAGE] = JSON.stringify(cards);
  }

  function hasStorageSkills() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }

  // ==========================
  // Helper elves
  // ==========================

  function knitFakeSocks() {
    var socks = [];
    socks.push({text: "one", size: CardSizes.XS});
    socks.push({text: "two", size: CardSizes.TO_DO});
    socks.push({text: "three", size: CardSizes.TO_DO});
    socks.push({text: "four", size: CardSizes.TO_DO});

    localStorage.removeItem(CARD_STORAGE);
    localStorage[CARD_STORAGE] = JSON.stringify(socks);
  }

});

