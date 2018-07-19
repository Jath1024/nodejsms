/*
* Primary File for the API
*
*
*/

//Dependencies

var http = require('http');
var url = require('url');

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

    //Send response
    res.end('Hello World! \n');

    //Log path that was requested
    console.log('The request is received on this path: ' + trimmedPath + ' with this method ' 
        + method + 'and these headers ', headers);
    
});

//Start server, listen on port 3000
server.listen(3000, function(){
    console.log('The server is listening on port 3000');
});