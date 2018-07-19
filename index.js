/*
* Primary File for the API
*
*
*/

//Dependencies

var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');

//The server should respond to all requests with a string
var server = http.createServer(function(req, res){

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
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
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
    
});

//Start server
server.listen(config.port, function(){
    console.log('The server is listening on port: ' + config.port + ' in ' + config.envName + ' mode');
});
//Define the handlers
var handlers = {};

// Sample handler
handlers.sample = function(data, callback){
    // Callback a http status code and a payload object
    callback(406,{'name': 'sample handler'});
};

// Define not found handler
handlers.notFound = function(data,callback){
    callback(404);

};

// Define a request router
var router = {
    'sample' : handlers.sample
};