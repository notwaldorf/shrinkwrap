function CardStorage(isUsingNode) {
	this.storageName = 'shrinkwrap.cards';
	this.nextCardID = 0; 

	this.isUsingNodeServer = isUsingNode;
	// this is only used if isUsingNodeServer is false (i.e. we are using the node server)
	this.serverCards = [];
}

CardStorage.prototype.add = function(card) {
	var cards = this.getAll();
	cards.push(card);

	card.id = this.generateId();
	card.text = card.text.replace('<script>', '').replace('</script>', '');
	
	this.updateIfNeeded(cards);
	return card;
}

CardStorage.prototype.remove = function(id) {
	var cards = this.getAll();
	var index = cards.findCard(id);
	if (index != -1) cards.remove(index);
	
	this.updateIfNeeded(cards);
}

CardStorage.prototype.move = function(card) {
	var cards = this.getAll();
    var index = cards.findCard(card.id);

    if (index != -1 ) {
    	var cardToMove = cards[index];
    	cardToMove.size = card.size;
    	cards.remove(index);

    	var insertAfter = cards.findCard(card.insertAfter);
    	cards.insert(insertAfter + 1, cardToMove);
    }
    this.updateIfNeeded(cards);
}

CardStorage.prototype.update = function(card) {
	var cards = this.getAll();
	var index = cards.findCard(card.id);

	if( index != -1) {
		var cardToUpdate = cards[index];
		cardToUpdate.text = card.text.replace('<script>', '').replace('</script>', '');	
	}
	this.updateIfNeeded(cards);
    return card
}

 CardStorage.prototype.clearAll = function() {
	if (!this.isUsingNodeServer)
	{
		localStorage.removeItem(this.storageName); 	
	}
	else
	{
		this.serverCards = [];
	}
	this.nextCardID = 0;
}

CardStorage.prototype.getAll = function() {
	if (this.isUsingNodeServer){
		// we actually need to get the max id to figure out what the next id should be
		var maxId = 0;
		for (var i = 0; i < this.serverCards.length; i++) {
			var thisId = parseInt(this.serverCards[i].id.substring(5));
			maxId = Math.max(maxId, thisId);
		}
		this.nextCardID = maxId + 1;
		return this.serverCards;
	}

    var stored = localStorage[this.storageName];
    var clientCards;
    if (stored == undefined) clientCards = []
    else                     clientCards = JSON.parse(stored);
	this.nextCardID = clientCards.length;
    return clientCards;
}		

  	// for local storage only
CardStorage.prototype.updateIfNeeded = function(c) {
	if (!this.isUsingNodeServer) localStorage[this.storageName] = JSON.stringify(c); 	
}

CardStorage.prototype.hasStorageSkills = function() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
}

CardStorage.prototype.generateId = function() {
	var id = "card-" + this.nextCardID;
	this.nextCardID = this.nextCardID + 1;
	return id;
}

CardStorage.prototype.generateTestingData = function() {
	var socks = Helpers.knitFakeSocks();

	if (!this.isUsingNodeServer) {
		localStorage.removeItem(this.storageName);
	localStorage[this.storageName] = JSON.stringify(socks);
	}
	else {
		this.serverCards = socks;
	}

	return socks;
}


// make available to server
if (typeof(module) !== 'undefined')
{
	module.exports = CardStorage;
}