  // ==========================
  // Helpers
  // ==========================
module ("helpers.js");

test( "array.remove works on normal arrays", function() {
	var arr = [1,2,3,4,5];
	arr.remove(2);
  	deepEqual(arr, [1,2,4,5]);
});

test( "array.remove works on empty arrays", function() {
  	var arr = [];
  	arr.remove(0);
  	deepEqual(arr, []);
});

test( "array.insert works on normal arrays", function() {
  	var arr = [1,2,3,4,5];
  	arr.insert(2, 7);
  	deepEqual(arr, [1,2,7,3,4,5]);
});

test( "array.insert works on empty arrays", function() {
  	var arr = [];
  	arr.insert(0, 1);
  	deepEqual(arr, [1]);
});

// ==========================
// Card storage
// ==========================
module ("card storage -- local");

function makeNewCard() {
	return {size:"todo", text:"whomp"};
}

function makeTestStorage() {
	var cardDB = new CardStorage(false);
	cardDB.storageName = 'shrinkwrap.tests';
	localStorage.removeItem(cardDB.storageName);
	return cardDB;
}

test( "db is initialized correctly", function() {
  	var cardDB = makeTestStorage();
  	equal(cardDB.nextCardID, 0);
  	equal(cardDB.serverCards.length,0);
});

test( "can add a card to the db", function() {
  	var cardDB = makeTestStorage();
  	var card = makeNewCard();

  	cardDB.add(card);

  	equal(cardDB.nextCardID, 1);
  	equal(cardDB.serverCards.length,0);
  	equal(cardDB.getAll().length, 1);
});

test( "can add multiple cards to the db", function() {
  	var cardDB = makeTestStorage();
  	var card = makeNewCard();

  	cardDB.add(card);
  	cardDB.add(card);
  	cardDB.add(card);

  	equal(cardDB.nextCardID, 3);
  	equal(cardDB.serverCards.length,0);
  	equal(cardDB.getAll().length, 3);
});

test( "can remove a card from the db", function() {
  	var cardDB = makeTestStorage();
  	var card = makeNewCard();

  	card = cardDB.add(card);
  	cardDB.remove(card.id);

  	equal(cardDB.nextCardID, 1);
  	equal(cardDB.serverCards.length,0);
  	equal(cardDB.getAll().length, 0);
});

test( "can remove multiple cards from the db", function() {
  	var cardDB = makeTestStorage();
  	var card = makeNewCard();

  	card = cardDB.add(card);
  	card = cardDB.add(card);
  	card = cardDB.add(card);
  	cardDB.remove(card.id);

  	equal(cardDB.nextCardID, 3);
  	equal(cardDB.serverCards.length,0);
  	equal(cardDB.getAll().length, 2);
});

test( "can move a card in the db", function() {
  	var cardDB = makeTestStorage();
  	var card = makeNewCard();

  	card = cardDB.add(card);
  	equal(card.size, "todo");
  	
  	var resizedCard = {id:card.id, size:"xs", text:card.text};
  	cardDB.move(resizedCard)

  	var allTheCards = cardDB.getAll();

  	equal(cardDB.nextCardID, 1);
  	equal(cardDB.serverCards.length,0);
  	equal(allTheCards.length, 1);
  	equal(allTheCards[0].size, "xs");
});

test( "moving a card maintains the right order", function() {
  	var cardDB = makeTestStorage();
  	var card0 = {size:"s", text:"first"};
  	var card1 = {size:"s", text:"second"};
  	var card2 = {size:"todo", text:"third"};

  	card0 = cardDB.add(card0);
  	card1 = cardDB.add(card1);
	card2 = cardDB.add(card2);

  	equal(card2.size, "todo");
  	
  	// move card3 in between card1 and card2
  	var resize = {id:card2.id, size:"s", insertAfter: card0.id};
  	cardDB.move(resize)

  	var allTheCards = cardDB.getAll();

  	equal(cardDB.nextCardID, 3);
  	equal(cardDB.serverCards.length,0);
  	equal(allTheCards.length, 3);
  	deepEqual(allTheCards[0], {size:"s", id:"card-0", text:"first"});
  	deepEqual(allTheCards[1], {size:"s", id:"card-2", text:"third"});
  	deepEqual(allTheCards[2], {size:"s", id:"card-1", text:"second"});
});

test( "can clear all cards", function() {
  	var cardDB = makeTestStorage();
  	var card = makeNewCard();

  	cardDB.add(card);
  	cardDB.add(card);
  	cardDB.add(card);

  	cardDB.clearAll();

  	equal(cardDB.nextCardID, 0);
  	equal(cardDB.serverCards.length,0);
  	equal(cardDB.getAll().length, 0);
});

test( "can get all cards", function() {
  	var cardDB = makeTestStorage();
  	var card0 = {size:"s", text:"first"};
  	var card1 = {size:"s", text:"second"};
  	var card2 = {size:"s", text:"third"};

  	card0 = cardDB.add(card0);
  	card1 = cardDB.add(card1);
	card2 = cardDB.add(card2);

  	var allTheCards = cardDB.getAll();

  	equal(cardDB.nextCardID, 3);
  	equal(cardDB.serverCards.length,0);
  	equal(allTheCards.length, 3);
  	deepEqual(allTheCards[0], {size:"s", id:"card-0", text:"first"});
  	deepEqual(allTheCards[1], {size:"s", id:"card-1", text:"second"});
  	deepEqual(allTheCards[2], {size:"s", id:"card-2", text:"third"});
});

test( "can generate sequential ids", function() {
	var cardDB = makeTestStorage();
	equal(cardDB.nextCardID, 0);
	
	var id = cardDB.generateId();
	equal(id, "card-0");
	equal(cardDB.nextCardID, 1);

	var id = cardDB.generateId();
	equal(id, "card-1");
	equal(cardDB.nextCardID, 2);
});
















