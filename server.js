process.title = 'node-shrinkwrap';

var WebSocketServer = require('websocket').server;
var http = require('http');

var port = 9000;

var clients = [];
var cards = [];

// HTTP Server
var httpServer = http.createServer(function(request, response) {});
httpServer.listen(port, function() {
    console.log("Server running on: " + port);
});

cards.push({text: "one", size: "todo", id:"card-0"});
cards.push({text: "two", size: "todo", id:"card-1"});
cards.push({text: "three", size: "todo", id:"card-2"});
cards.push({text: "four", size: "todo", id:"card-3"});

// Web Sockets Server
var wsServer = new WebSocketServer({
    httpServer: httpServer
});

wsServer.on('request', function(request) {
	console.log('Received connection from ' + request.origin);
    var connection = request.accept(null, request.origin); 
    console.log('Connection accepted. Arm the toboggans and sending over any cards'); 
    connection.sendUTF(JSON.stringify(cards));

    // remember this connection
    var whoAmI = clients.push(connection) - 1;

    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
        	var card = JSON.parse(message.utf8Data);
        	console.log(' Received Message: ' + message.utf8Data);

        	if (card.action == 'add')
        	{
        		cards.push(card);
        	}
        	if (card.action == 'remove')
        	{
        		var index = cards.findCard(card.id);
        		if (index != -1) cards.remove(index);
        	}
        	if (card.action == 'move')
        	{
        		var index = cards.findCard(card.id);
        		if (index != -1) cards[index].size = card.size;
        	}

        	// broadcast this
        	// lame version for now: send everything to all the clients
        	// makes it easier to display on the client side
        	var cardsAsText = JSON.stringify(cards);
        	for (var i = 0; i < clients.length; i++) {
            	clients[i].sendUTF(cardsAsText);
            }
        	//var json = JSON.stringify({ type:'message', data: message.utf8Data });
            //for (var i = 0; i < clients.length; i++) {
            //	clients[i].sendUTF(JSON.stringify(json));
            //}
        }
    });   
});

Array.prototype.findCard = function(id) {
    for (var i = 0; i < this.length; i++) {
      if (this[i].id == id) return i;
    }
    return -1;
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};


