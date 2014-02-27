$(function() {
  
  // set up the web socket
  var IS_SERVER_OK = false;
  var connection;
  var cardsDB;

  window.WebSocket = window.WebSocket || window.MozWebSocket;

  $(document).ready(makeThingsGo);

  // ==========================
  // Event handlers etc
  // ==========================
  function makeThingsGo() {
    // resize the suit to fit however many columns there are
    $('.suit').css('width', $('.suit').children().length * 175);
    $('#new-card-box').hide();
    $('#server-ok').hide();
    $('#server-down').hide();

    $('#add-new-card').click(function(){
      $("#new-card-box").show('fast');
      $('#card-text').val('');
      $("#card-text").focus(); 
    });

    $('#clear-cards').click(clearCards);
    
    $('#cancel-card').click(function(){
      $("#new-card-box").hide('fast');
    });

    $('#save-card').click(function(){
      var text = $('#card-text').val().replace('<script>', '').replace('</script>', '');
      addCard(text);
      $("#new-card-box").hide('fast');
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
          ui.placeholder.css("border-width", "1px");
          ui.placeholder.css("border-color", "#b9b9b9");
        },
        stop: function(event, ui) {
          var newColumn = ui.item.parent();
          var id = ui.item.attr('id');
          var previousSibling = ui.item.prev().attr('id');
          var newSize = newColumn.attr('id').substr(Constants.columnIdPrefix.length);
          moveCard(id, newSize, previousSibling);
        }
      });

    // ==========================
    // WebSockets 
    // ==========================

    // open connection!
    connection = new WebSocket(Constants.serverUrl);
    
    connection.onopen = function () {
        ServerStatus.up();
        IS_SERVER_OK = true;
        cardsDB = new CardStorage(true);
    };

    connection.onclose = function () {
        ServerStatus.down();
        IS_SERVER_OK = false;
        cardsDB = new CardStorage(false);

        // for testing only
        if (localStorage[cardsDB.storageName] == undefined)
        {
           cardsDB.generateTestingData();
        }   
        DisplayElf.showAll(cardsDB.getAll());   
    };

    connection.onerror = function () {
        ServerStatus.down();
        IS_SERVER_OK = false;
        cardsDB = new CardStorage(false);
        
        // for testing only
        if (localStorage[cardsDB.storageName] == undefined)
        {
           cardsDB.generateTestingData();
        }   
        DisplayElf.showAll(cardsDB.getAll());   
    }; 

    connection.onmessage = function (message) {
      var somethingICanWorkWith = JSON.parse(message.data);
      DisplayElf.showAll(somethingICanWorkWith);
    }
  }



  // ==========================
  // Main logic
  // ==========================

  function addCard(name) {
    // todo: validations: no duplicate names, no empties
    var newCard = {text:name, size:Constants.CardSizes.TO_DO};

    if (IS_SERVER_OK)
    {
      connection.send(JSON.stringify({action:"add", data:newCard}));
    }
    else
    {
      newCard = cardsDB.add(newCard);
      DisplayElf.show(newCard);
    }
  }

  function removeCard(id)
  {
    if (IS_SERVER_OK)
    {
      connection.send(JSON.stringify({action:"remove", data:id}));
    }
    else
    {
      cardsDB.remove(id);  
      DisplayElf.vaporize(id);
    }
  } 

  function moveCard(id, newSize, insertAfter)
  {
    var resizedCard = {id:id, size:newSize, insertAfter:insertAfter};
    if (IS_SERVER_OK)
    {
      connection.send(JSON.stringify({action:"move", data:resizedCard}))
    }
    else
    {
      cardsDB.move(resizedCard);  
    }
  } 

  function clearCards() 
  {
    if (IS_SERVER_OK)
    {
      connection.send(JSON.stringify({action:"clear"}));
    }
    else
    {
      cardsDB.clearAll(); 
      DisplayElf.showAll();
    }
  }

  function updateCard(id, newText)
  {
    console.log(id)
    var updateCard = {id:id, text:newText, size:Constants.CardSizes.TO_DO};
    if ( IS_SERVER_OK)
    {
      console.log(updateCard)
      connection.send(JSON.stringify({action:"update", data:updateCard}))
    }
    else
    {
      cardsDB.update(updateCard)
      DisplayElf.show(updateCard)
    }
  }
  

  // ==========================
  // Edit Things
  // ==========================

  $(document).on('dblclick', ".card span", function(){
    $(this).html('<input class="card-edit" type="text" value="'+$(this).text()+'"/>')
  })

  $(document).on('keypress', ".card-edit",function(e){
    if(e.which == 13){
      var newText = this.value
      var jThis = $(this);
      var cardId = jThis.parent().parent().attr('id');
      
      this.outerHTML = '<span>'+newText+'</span>'
      updateCard(cardId, this.value);
    }
  })

  // ==========================
  // Display things
  // ==========================
  var DisplayElf = new function(){
    this.show = function(card) {
      var jCol = $('#column-' + card.size);
      jCol.append('<li class="card" id="' + card.id + '">' +
        '<i class="icon-remove card-btn remove"></i><span>' + 
        card.text + '</span></li>'); 
    }

    this.vaporize = function(id) {
      $('#' + id).remove(); 
    }

    this.showAll = function(cards) {
      this.vaporizeAll();
      if (cards == null) return;

      for (var i = 0; i < cards.length; i++) {
        this.show(cards[i]);
      }
    }

    this.vaporizeAll = function() {
      for (var i = 0; i < Constants.columns.length; i++) {
        var jCol = $(Constants.columns[i]);
        jCol.children().remove(".card");  
      }
    }
  }
  
  // ==========================
  // Server status
  // ==========================
  var ServerStatus = new function(){
    this.up = function() {
      $('#server-ok').show();
      $('#server-down').hide();
    }

    this.down = function() {
      $('#server-ok').hide();
      $('#server-down').show();  
    }
  }
});

