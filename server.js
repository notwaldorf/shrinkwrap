process.title = 'node-shrinkwrap';

var WebSocketServer = require('websocket').server;
var http = require('http');
var static = require('node-static');
var Constants = require('./js/helpers');
var CardStorage = require('./js/card-storage');
var file = new(static.Server)('./');
var fs = require('fs');


var clients = [];
var serverDB = new CardStorage(true);
var dbFileName = "./" + serverDB.storageName;

// HTTP Server
var httpServer = http.createServer(function(request, response) {
	request.addListener('end', function(){
		file.serve(request,response);
	})
}).listen(Constants.serverPort, function() {
    console.log("Server running on: " + Constants.serverPort);

    // read the db and load anything in it
    fs.readFile(dbFileName, "utf8", function(err, data) {
        if (err) {
            console.log("Can't read db: ", err);
        }
        else {
            serverDB.serverCards = JSON.parse(data);
        }
    });

});

// Web Sockets Server
var wsServer = new WebSocketServer({
    httpServer: httpServer
});

wsServer.on('request', function(request) {
	console.log('Received connection from ' + request.origin);
    var connection = request.accept(null, request.origin); 
    clients.push(connection);

    connection.sendUTF(JSON.stringify(serverDB.getAll()));

    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            console.log('Received Message: ' + message.utf8Data);

        	var json = JSON.parse(message.utf8Data);

            var action = json.action;            
            var card = json.data;

            switch (action) {
            case 'add':
                serverDB.add(card);
                break;
            case 'remove':
                serverDB.remove(card);
                break;
            case 'move':
                serverDB.move(card);
                break;
            case 'clear':
                serverDB.clearAll();
                break;
            }
        	
        	var cardsAsText = JSON.stringify(serverDB.getAll());

            // this bit is really gross and i should fix it asap
            fs.unlink(dbFileName);
            fs.writeFile(dbFileName, cardsAsText, function(err) {
                if (err) {
                    console.log(err);
                }
            });

            // broadcast to clients
            // note: in the future, we can broadcast delta updates if we find a performance problem
        	for (var i = 0; i < clients.length; i++) {
            	clients[i].sendUTF(cardsAsText);
            }
        }
    });   
});
