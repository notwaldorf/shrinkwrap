var ClientStorage = new function(){
	this.LOCATION = 'shrinkwrap.cards';
	this.totalCards = 0;
	this.serverCards = [];
	this.IS_LOCAL_ONLY = false;


	this.add = function(card) {
		card.id = this.generateId();
		var cards = this.getAll();
    	cards.push(card);

    	this.updateIfNeeded(cards);
    	return card;
	}

	this.remove = function(id) {
		var cards = this.getAll();
    	var index = cards.findCard(id);
    	if (index != -1) cards.remove(index);
    	
    	this.updateIfNeeded(cards);
	}

	this.move = function(card) {
		var cards = this.getAll();
	    var index = cards.findCard(card.id);
	    if (index != -1 ) cards[index].size = card.size;

	    this.updateIfNeeded(cards);
  	}

  	this.clearAll = function() {
		if (this.IS_LOCAL_ONLY)
		{
			localStorage.removeItem(this.LOCATION); 	
		}
		else
		{
			this.serverCards = [];
		}
    	this.totalCards = 0;
	}

	this.getAll = function() {
  		if (!this.IS_LOCAL_ONLY){
  			this.totalCards = this.serverCards.length;
  			return this.serverCards;
  		}

	    var stored = localStorage[this.LOCATION];
	    var clientCards;
	    if (stored == undefined) clientCards = []
	    else                     clientCards = JSON.parse(stored);
		this.totalCards = clientCards.length;
	    return clientCards;
  	}	

  	// for local storage only
	this.updateIfNeeded = function(c) {
		if (this.IS_LOCAL_ONLY) localStorage[this.LOCATION] = JSON.stringify(c); 	
	}

  	this.hasStorageSkills = function() {
	    try {
	      return 'localStorage' in window && window['localStorage'] !== null;
	    } catch (e) {
	      return false;
	    }
  	}

  	this.generateId = function() {
    	var id = "card-" + this.totalCards;
    	this.totalCards = this.totalCards + 1;
    	return id;
  	}

  	this.generateTestingData = function() {
  		var socks = Helpers.knitFakeSocks();

  		if (this.IS_LOCAL_ONLY) {
  			localStorage.removeItem(this.LOCATION);
	    	localStorage[this.LOCATION] = JSON.stringify(socks);
  		}
  		else {
  			this.serverCards = socks;
  		}

	    return socks;
  	}
}

// make available to server
if (typeof(module) !== 'undefined')
{
	module.exports = ClientStorage;

}