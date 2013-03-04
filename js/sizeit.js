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

  var totalCards = 0;

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
      var cardId = jThis.parent().attr('id');
      removeCard(cardId);
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
          var id = ui.item.attr('id');
          var newSize = newColumn.attr('id').substr(7);
          moveCard(id, newSize);
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
      var somethingICanWorkWith = JSON.parse(message.data);

      displayCards(somethingICanWorkWith);
      
    }
  }




  // ==========================
  // Display cards
  // ==========================

  function addNewCard(name) {
    // todo: validations: no duplicate names, no empties
    var newId = generateId();

    if (IS_SERVER_OK)
    {
      connection.send(JSON.stringify(
        {action:"add", text:name, size:CardSizes.TO_DO, id:newId}));
      // we'll display it when the server tells us to
    }
    else
    {
      var card = {text:name, size:CardSizes.TO_DO, id:newId};
      putSockInDrawer(card);
      displayACard(card);
    }
    $("#new-card-box").hide('fast');
  }

  function removeCard(id)
  {
    if (IS_SERVER_OK)
    {
      connection.send(JSON.stringify({action:"remove", id:id}));
      // we'll undisplay it when the server tells us to
    }
    else
    {
      removeSockFromDrawer(id);  
      undisplayACard(id);
    }
  } 

  function moveCard(id, newSize)
  {
    if (IS_SERVER_OK)
    {
      connection.send(JSON.stringify({action:"move", id:id, size: newSize}));
      // we'll move it when the server tells us to
    }
    else
    {
      stretchSockInDrawer(id, newSize);  
    }
  } 
  
  function displayACard(card) {
    var jCol = $('#column-' + card.size);
    jCol.append('<li class="card" id="' + card.id + '">' +
        '<i class="icon-remove card-btn remove"></i><span>' + 
        card.text + '</span></li>'); 
  }

  function undisplayACard(id) {
    $('#' + id).remove();
  }

  function displayCards(cards) {
    // first clear everything
    for (var i = 0; i < columns.length; i++) {
      var jCol = $(columns[i]);
      jCol.children().remove(".card");  
    }
    if (cards == null) return;

    for (var i = 0; i < cards.length; i++) {
      displayACard(cards[i]);
    }

    totalCards = cards.length;
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
    totalCards = 0;
  }

  function putSockInDrawer(sock) {
    var cards = safeGetStorage();
    cards.push(sock);
    localStorage[CARD_STORAGE] = JSON.stringify(cards);
  }

  function removeSockFromDrawer(id) {
    var cards = safeGetStorage();
    var index = findCard(cards, id);
    if (index != -1) cards.remove(index);
    localStorage[CARD_STORAGE] = JSON.stringify(cards);
  }

  function stretchSockInDrawer(id, newSize) {
    var cards = safeGetStorage();
    var index = findCard(cards, id);
    cards[index].size = newSize;
    localStorage[CARD_STORAGE] = JSON.stringify(cards);
  }

  function findCard(cards, id) {
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].id == id) return i;
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
  function generateId() {
    var id = "card-" + totalCards;
    totalCards = totalCards + 1;
    return id;
  }

  function knitFakeSocks() {
    var socks = [];
    socks.push({text: "one", size: CardSizes.XS, id:"card-0"});
    socks.push({text: "two", size: CardSizes.TO_DO, id:"card-1"});
    socks.push({text: "three", size: CardSizes.TO_DO, id:"card-2"});
    socks.push({text: "four", size: CardSizes.TO_DO, id:"card-3"});

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

