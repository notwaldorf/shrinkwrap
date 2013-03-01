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
  var IS_SERVER_OK = false;
  var columns = [
                    '#column-xs',
                    '#column-s',
                    '#column-m',
                    '#column-l',
                    '#column-xl',
                    '#column-todo']
  var connection;

  $(document).ready(makeThingsGo);

  window.WebSocket = window.WebSocket || window.MozWebSocket;

  // ==========================
  // Event handlers etc
  // ==========================
  function makeThingsGo() {

    $('#new-card-box').hide();
    $('#server-ok').hide();
    $('#server-down').hide();

    $('#add-new-card').click(function(){
      $("#new-card-box").show('fast');
      $('#card-text').val('');
      $("#card-text").focus(); 
    });

    $('#clear-cards').click(clearStorage);
    
    $('#cancel-card').click(function(){
      $("#new-card-box").hide('fast');
    });

    $('#save-card').click(function(){
      addNewCard($('#card-text').val());
    });
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
        cancel: 'span',
        distance: 5,
        opacity: 0.6,
        placeholder: 'ghost',
        forcePlaceholderSize: true,
        start: function(event, ui) {
          // for some reason the placeholder style isn't actually applied
          ui.placeholder.css("background-color", "transparent");
          ui.placeholder.css("border-style", "dashed");
        },
        receive: function(event, ui) {
          var newColumn = ui.item.parent();
          var text = ui.item.text();
          var newSize = newColumn.attr('id').substr(7);
          updateCardSize(text, newSize);
        }
      });

    // ==========================
    // WebSockets 
    // ==========================

    // open connection!
    connection = new WebSocket('ws://127.0.0.1:9000');
    
    connection.onopen = function () {
        showServerUp();
        IS_SERVER_OK = true;
    };

    connection.onclose = function () {
        showServerDown();
        IS_SERVER_OK = false;
    };

    connection.onerror = function () {
        showServerDown();
        IS_SERVER_OK = false;
    }; 

    connection.onmessage = function (message) {
      console.log("received from server", message);
    }
  }


  // ==========================
  // Display cards
  // ==========================

  function addNewCard(name) {
    // todo: validations
    // no duplicate names, no empties
    if (IS_SERVER_OK)
    {
      connection.send(JSON.stringify({action:"add", name:name, size:CardSizes.TO_DO}));
    }
    else
    {
      putSockInDrawer(name, CardSizes.TO_DO);  
    }
    $('#column-todo').append('<li class="card">' +
        '<i class="icon-remove card-btn remove"></i><span>' + 
        name + '</span></li>');
    $("#new-card-box").hide('fast');
  }

  function removeCard(name, size)
  {
    if (IS_SERVER_OK)
    {
      connection.send(JSON.stringify({action:"delete", name:name, size:size}));
    }
    else
    {
      removeSockFromDrawer(name, size);  
    }
  } 

  function updateCardSize(name, newSize)
  {
    if (IS_SERVER_OK)
    {
      connection.send(JSON.stringify({action:"resize", name:name, size: newSize}));
    }
    else
    {
      stretchSockInDrawer(name, size);  
    }
  } 

  function displayCards(cards) {
    // first clear everything
    for (var i = 0; i < columns.length; i++) {
      var jCol = $(columns[i]);
      jCol.children().remove(".card");  
    }

    if (cards == null) return;

    for (var i = 0; i < cards.length; i++) {
      var jCol = $('#column-' + cards[i].size);
      jCol.append('<li class="card">' +
        '<i class="icon-remove card-btn remove"></i><span>' + 
        cards[i].text + '</span></li>');  
    }
  }

  // ==========================
  // Save and load cards from local storage
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

  function removeSockFromDrawer(name, size) {
    var cards = safeGetStorage();

    // todo: when moving is saved, also compare size matches
    var index = findCard(cards, name);
    if (index != -1) cards.remove(index);
    localStorage[CARD_STORAGE] = JSON.stringify(cards);
  }

  function stretchSockInDrawer(name, newSize) {
    var cards = safeGetStorage();
    var index = findCard(cards, name);
    cards[index].size = newSize;
    localStorage[CARD_STORAGE] = JSON.stringify(cards);
  }

  function findCard(cards, name) {
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].text == name.replace("↵", "\n")) return i;
    }
    return -1;
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
    var cards;
    if (stored == undefined) cards = []
    else                     cards = JSON.parse(stored);
    return cards;
  }

  // ==========================
  // Server status
  // ==========================
  function showServerUp() {
    $('#server-ok').show();
    $('#server-down').hide();
  }
  function showServerDown() {
    $('#server-ok').hide();
    $('#server-down').show();

    // for testing only
    if (localStorage[CARD_STORAGE] == undefined)
      knitFakeSocks();

    loadAllStorage();
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

