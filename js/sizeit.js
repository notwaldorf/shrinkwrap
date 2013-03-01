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

  // bind all the future added icons too
  $(document).on("click", "i.remove", function(){
    var jThis = $(this);
    var text = jThis.parent().text();
    var column = jThis.parent().parent().attr('id').substr(7);
    $(this).parent().remove();
    removeCard(text, column);
  });  

  // ==========================
  // Drag and drop
  // ==========================

  $( "[id^='column-']" ).sortable({
      connectWith: ".draggable",
      items: 'li:not(.no-drag)',
      distance: 5,
      opacity: 0.6,
      placeholder: 'ghost',
      forcePlaceholderSize: true,
      'start': function(event, ui) {
        // for some reason the placeholder style isn't actually applied
        ui.placeholder.css("background-color", "transparent");
        ui.placeholder.css("border-style", "dashed");
      }
    });

  // for testing only
  if (localStorage[CARD_STORAGE] == undefined)
    knitFakeSocks();

  loadAllStorage();


  // ==========================
  // Display cards
  // ==========================

  function addNewCard() {
    var contents = $('#card-text').val();

    // todo: validations
    // no duplicate names, no empties
    putSockInDrawer(contents, CardSizes.TO_DO);
    $('#column-todo').append('<li class="card">' +
        '<i class="icon-remove card-btn remove"></i>' + 
        contents + '</li>');
    $("#new-card-box").hide('fast');
  }

  function removeCard(name, size) {
    var cards = safeGetStorage();

    // todo: when moving is saved, also compare size matches
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].text == name)
      {
        cards.remove(i);
        break;
      }  
    }
    localStorage[CARD_STORAGE] = JSON.stringify(cards);
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
      jCol.append('<li class="card">' +
        '<i class="icon-remove card-btn remove"></i>' + 
        cards[i].text + '</li>');  
    }
  }

  // ==========================
  // Save and load cards
  // ==========================

  function loadAllStorage() {
    var cards = safeGetStorage();
    displayCards(cards);
  }

  function clearStorage() {
    localStorage.removeItem(CARD_STORAGE);  
    displayCards(null);
  }

  function putSockInDrawer(sock, size) {
    var cards = safeGetStorage();
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

  function safeGetStorage() {
    var stored = localStorage[CARD_STORAGE];
    if (stored == undefined)
      var cards = []
    else
      cards = JSON.parse(stored);
    return cards;
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

  // Array Remove - By John Resig (MIT Licensed)
  Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  };

});

