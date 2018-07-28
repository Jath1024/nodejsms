/*
*
* Server - related tasks
*
*/

//Dependencies

var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('../config');
var fs = require('fs');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');

// Instantiate the server module object
var server = {};

// @TODO Get rid of this
// helpers.sendTwilioSMS('7399144504','Hola',function(err){
//     console.log('this was the error',err);
// });

// Instantiate the http Web Server object. The function that is passed to the create server object is called once for every HTTP request that's 
// made against it. The server object returned by createServer is an EventEmitter.
// https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
server.httpServer = http.createServer(function(req, res){
    server.unifiedServer(req, res);
});

// Instantiate the HTTPS web server object.
server.httpsServerOptions = {
    'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res) {
    server.unifiedServer(req, res);
});

// All the server logic for both the http and https server
server.unifiedServer = function(req, res){

    //Parse URL
    var parsedUrl = url.parse(req.url, true);

    //Get path from URL
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string from the request
    var queryStringObject = parsedUrl.query;

    // Get HTTP method
    var method = req.method.toLowerCase();

    // Get the headers
    var headers = req.headers;

    // Get the payload, if exists
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data',function(data){
        buffer += decoder.write(data);
    });
    req.on('end', function(){
        buffer += decoder.end();
    
        // Choose the handler this request should go to. If one is not found, use the not found handler
        var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        };

        //Route the request to the handler specified in the router
        chosenHandler(data,function(statusCode,payload) {
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            
            // Use the payload balled back by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            //Log path that was requested
            console.log('Returning this response: ', statusCode, payloadString);

        });
        
    });
};

// Define a request router
server.router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens,
    'checks' : handlers.checks
};

server.init = function(){
    //Start the http server
    server.httpServer.listen(config.httpPort, function(){
        console.log('The server is listening on port: ' + config.httpPort + ' in ' + config.envName + ' mode');
    });

    // Start the HTTPS server/
    server.httpsServer.listen(config.httpsPort, function(){
        console.log('The server is listening on port: ' + config.httpsPort + ' in ' + config.envName + ' mode');
    });
};

// Export the module
module.exports = server;