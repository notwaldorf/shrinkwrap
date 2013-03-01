process.title = 'node-shrinkwrap';

var WebSocketServer = require('websocket').server;
var http = require('http');

var port = 9000;

var clients = [];

// HTTP Server
var httpServer = http.createServer(function(request, response) {});
httpServer.listen(port, function() {
    console.log("Server running on: " + port);
});


// Web Sockets Server
var wsServer = new WebSocketServer({
    httpServer: httpServer
});

wsServer.on('request', function(request) {
	console.log('Received connection from ' + request.origin);
    var connection = request.accept(null, request.origin); 
    console.log('Connection accepted. Arm the toboggans');

    // remember this connection
    var whoAmI = clients.push(connection) - 1;

    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
        	console.log(' Received Message: ' + message.utf8Data);

        	// broadcast this
        	var json = JSON.stringify({ type:'message', data: message.utf8Data });
            for (var i = 0; i < clients.length; i++) {
            	clients[i].sendUTF(json);
            }
             
        }
    });
});

