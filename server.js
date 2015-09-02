var osc = require('osc');
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');

var server = http.createServer(handleRequest);
server.listen(8080);

console.log('Server started on port 8080');

function handleRequest(req, res) {
    // What did we request?
    var pathname = req.url;

    // If blank let's ask for index.html
    if (pathname == '/') {
        pathname = '/index.html';
    }

    // Ok what's our file extension
    var ext = path.extname(pathname);

    // Map extension to file type
    var typeExt = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css'
    };

    // What is it?  Default to plain text
    var contentType = typeExt[ext] || 'text/plain';

    // User file system module
    fs.readFile(__dirname + pathname,
        // Callback function for reading
        function(err, data) {
            // if there is an error
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ' + pathname);
            }
            // Otherwise, send the data, the contents of the file
            res.writeHead(200, {
                'Content-Type': contentType
            });
            res.end(data);
        }
    );
}

var  udpPort  =  new  osc.UDPPort({    
    localAddress:   "0.0.0.0",
    localPort:  5001
}); 
// Listen for incoming OSC bundles. 
udpPort.on("message",  function (oscMsg)  {    
    //console.log("An OSC msg just arrived!",  oscMsg);
    io.sockets.emit('osc', oscMsg);
});

udpPort.open();


var io = require('socket.io').listen(server);
io.sockets.on('connection',
    function(socket) {
        console.log("We have a new client: " + socket.id);
        socket.on('osc',
            function(data) {
                //console.log("Received: 'osc' " + data);
                udpPort.send({
                    address: "/update",
                    args: data
                },"127.0.0.1", 5005);

            }
        );

        socket.on('disconnect', function() {
            console.log("Client has disconnected");
        });
    }
);
