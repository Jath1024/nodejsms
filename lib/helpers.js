/*
* Helpers for various tasks
*
*
*/

// Dependencies
var crypto = require('crypto');
var config = require('../config')
var https = require('https');
var querystring = require('querystring');

// Container for all the helpers
var helpers = {};

// Create a SHA256 hash
helpers.hash = function(str) {
    if(typeof(str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Parse a JSON string to an object in all cases without throwing 
helpers.parseJsonToObject = function(str) { 
    try{
        var obj = JSON.parse(str);
        return obj;
    }catch(e){
        return {};
    }
};


// Create string of random alphanumeric characters of a given length
helpers.createRandomString = function(strLength) {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if(strLength){
        // Define all the possible characters that could go into a string
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the string
        var str = '';

        for(i=0;i<strLength;i++){
            // Get a random character from the possibleCharaters string
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // Append this character to the final string
            str+=randomCharacter;
        }

        return str;

    } else {
        return(false);
    }
    
};

// Send an SMS via Twilio
helpers.sendTwilioSMS = function(phone,msg,callback) {
    // Validate the parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
    if(phone&&msg){
        // Configure the request payload 
        var payload = {
            'From' : config.twilio.fromPhone,
            'To' : '+44'+phone,
            'Body' : msg
        };
        // Stringify the payload - not JSON stringify as the target Twilio API is not a JSON API - the content type of the payload is x-www-form-urlencoded
        var stringPayload = querystring.stringify(payload);

        // Configure the request details
        var requestDetails = {
            'protocol' : 'https:',
            'hostname' : 'api.twilio.com',
            'method' : 'POST',
            'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
            'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
            'headers' : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' : Buffer.byteLengthLength(stringPayload)
            }
        };

        // Instantiate the request object
        var req = https.request(requestDetails,function(res){
            // Grab the status of the send request
            var status = res.statusCode;
            // Callback success if request went through
            if(status == 200 || status == 201) {
                callback(false);
            } else {
                callback('Status code was '+statusCode);
            }
        });

        // Bind to the error event so it doesn't get thrown
        req.on('error',function(e){
            callback(e);
        });

        // Add the payload to the request
        req.write(stringPayload);

        // End the request
        req.end();

    } else {
        callback('Given parameters were missing or invalid');
    }
}












module.exports = helpers;