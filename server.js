process.title = 'node-shrinkwrap';

var WebSocketServer = require('websocket').server;
var http = require('http');

var port = 9000;

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
});

