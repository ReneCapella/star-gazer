////////////////////////////////
//EXTERNAL IMPORTS
////////////////////////////////
const Alexa = require('alexa-sdk');
const request = require('request');
const https = require('https');

////////////////////////////////
//TEXT STRINGS-modify to change behavior of Lambda
////////////////////////////////
// var myRequest = 'Paris';
var responseDataArray = [];

////////////////////////////////
// SKILL CONSTANTS
////////////////////////////////
var APP_ID = 'amzn1.ask.skill.92a24c78-c2ca-410f-aa76-9ea83c7dcf55';//Application ID here from Dev Portal

var SKILL_NAME = "Star Gazer";//Skill Name Goes here
var WELCOME_MESSAGE = "I love to gaze at the stars. How can I help you?";
var GET_WEATHER_MESSAGE = "I'm learning how to tell you whether the weather is good for star gazing!";
var HELP_MESSAGE = "You can say is the weather good for star gazing, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "When would you like to see the stars?";
var STOP_MESSAGE = "Happy gazing! Goodbye!";


////////////////////////////////
//============================//
// HANDLER CODE
//============================//
////////////////////////////////
exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);
    alexa.appId = 'amzn1.ask.skill.92a24c78-c2ca-410f-aa76-9ea83c7dcf55';
    alexa.registerHandlers(handlers);//separate multiple handlers by ','
    alexa.execute();
};

/////////////////////////////////
//INTENT HANDLERS
/////////////////////////////////
var handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', WELCOME_MESSAGE, WELCOME_MESSAGE);
    },
    'Unhandled': function () {
    this.emit(':ask', HELP_MESSAGE);
    },
    'GetWeatherTodayIntent': function (event) {
        var zipcode = this.event.request.intent.slots.Zipcode.value;
        if (zipcode.length > 0){
            var myRequest =
            this.event.request.intent.slots.Zipcode.value;
            httpsGet(myRequest,  (myResult) => {
                    console.log("sent     : " + myRequest);
                    console.log("received : " + myResult);

                    this.emit(':tell', 'The weather for star gazing in ' + myRequest + ' is ' + myResult );

                }
            );
        } else {
            this.emit(':tell', 'Oops, I forgot to get your location.');
        }
        console.log(myRequest);
    },
    'AMAZON.HelpIntent': function (req, res) {
        console.log(req);
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function (req, res) {
        console.log(req);
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function (req, res) {
        console.log(req);
        this.emit(':tell', STOP_MESSAGE);
    }
 };
////////////////////////////////
//==============================
//END OF INTENT handlers
//==============================
////////////////////////////////
//---------------------------------------------------

////////////////////////////////
//============================//
// HELPER FUNCTION
//============================//
////////////////////////////////
var apiKey = '6deb7aeace39475b96d191651172505'
var httpsGet = function (myData, callback) {

    // Update these options with the details of the web service you would like to call
    var options = {
        host: 'api.apixu.com',
        port: 443,
        path: '/v1/current.json?key=' + apiKey +'&q=' + encodeURIComponent(myData),
        method: 'GET'
    };

    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";


        res.on('data', chunk => {

            returnData = returnData + chunk;
            console.log("return data from API" + returnData);
        });

        res.on('end', () => {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed data

            var pop = JSON.parse(returnData);
            console.log("pop", pop.current.condition.text);

            callback(pop.current.condition.text);  // this will execute whatever function the caller defined, with one argument

        });

    });
    req.end();

}







///////////////////////////////////////////
//=======================================//
//============GRAVE======================//
//=================YARD==================//
//======in case zombies are needed=======//
///////////////////////////////////////////

// url: 'https://api.enphaseenergy.com/api/v2/systems/67/summary',
// method: 'GET',
// headers: {
//   Accept: 'application/json',
//   'Content-Type': 'application/json'
// },
// body: JSON.stringify({
//   key: '5e01e16f7134519e70e02c80ef61b692',
//   user_id: '4d7a45774e6a41320a'
// })
// }, function (error, response, body) {
// if (!error && response.statusCode == 200) {
//   console.log('BODY: ', body);
//   var jsonResponse = JSON.parse(body); // turn response into JSON
//
//   // do stuff with the response and pass it to the callback...
//
//   callback(sessionAttributes,
//       buildSpeechletResponse(intent.name, speechOutput, repromptText,
//       shouldEndSession));
// }
// });

// {
//  "version": "1.0",
//  "response": {
//    "outputSpeech": {"type":"PlainText","text":"Text to speak back to the user."},
//    "card": {
//      "type": "Simple",
//      "title": "Example of the Card Title",
//      "content": "Example of card content. This card has just plain text content.\nThe content is formatted with line breaks to improve readability."
//    }
//  }
// }
//
// {
//  "version": "1.0",
//  "response": {
//    "outputSpeech": {"type":"PlainText","text":"Your Car-Fu car is on the way!"},
//    "card": {
//      "type": "Standard",
//      "title": "Ordering a Car",
//      "text": "Your ride is on the way to 123 Main Street!\nEstimated cost for this ride: $25",
//      "image": {
//        "smallImageUrl": "https://carfu.com/resources/card-images/race-car-small.png",
//        "largeImageUrl": "https://carfu.com/resources/card-images/race-car-large.png"
//      }
//    }
//  }
// }
// {
//  "version": "1.0",
//  "response": {
//    "outputSpeech": {"type":"PlainText","text":"Please go to your Alexa app and link your account."},
//    "card": {
//      "type": "LinkAccount"
//    }
//  }
// }


// var states = {
//     STARTMODE: '_STARTMODE'  // Prompt the user to start or restart the game.
// };

// var url = function(){
//     return "http://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=Albert+Einstein";
// };
// 'AMAZON.SearchAction<object@WeatherForecast>': function (req, res) {
//     console.log(req);
// },
// 'AMAZON.SearchAction<object@WeatherForecast[weatherCondition]>': function (req, res) {
//     console.log(req);
// },
// 'AMAZON.SearchAction<object@WeatherForecast[temperature]>': function (req, res) {
//     console.log(req);
// },
// IF I HAD A DB
// alexa.dynamoDBTableName = 'starGazing';

// var getJSON = function (callback) {
//     // HTTP - WIKPEDIA
//     request.get(url(), function(error, response, body) {
//         var d = JSON.parse(body);
//         console.log(response);
//         console.log(body);
//         console.log("inside getJSON");
//         var result = d.query.searchinfo.totalhits
//         if (result > 0) {
//             callback(result);
//         } else {
//             callback("ERROR")
//         }
//     });
//
//     // HTTPS
//     // request.get(url2(), function(error, response, body) {
//     //     var d = JSON.parse(body)
//     //     var result = d.results
//     //     if (result.length > 0) {
//     //         callback(result[0].book_details[0].title)
//     //     } else {
//     //         callback("ERROR")
//     //     }
//     // })
// };
