var Alexa = require('alexa-sdk');

var APP_ID = undefined;//Application ID here from Dev Portal

var SKILL_NAME = "Space Facts";//Skill Name Goes here
var GET_FACT_MESSAGE = "Here's your fact: ";
var HELP_MESSAGE = "You can say tell me a space fact, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Goodbye!";

//========================================
//Now for some data about space objects
//========================================

var data = [
    "A year on Mercury is just 88 days long.",
    "Despite being farther from the Sun, Venus experiences higher temperatures than Mercury.",
    "Venus rotates counter-clockwise, possibly because of a collision in the past with an asteroid.",
    "On Mars, the Sun appears about half the size as it does on Earth.",
    "Earth is the only planet not named after a god.",
    "Jupiter has the shortest day of all the planets.",
    "The Milky Way galaxy will collide with the Andromeda Galaxy in about 5 billion years.",
    "The Sun contains 99.86% of the mass in the Solar System.",
    "The Sun is an almost perfect sphere.",
    "A total solar eclipse can happen once every 1 to 2 years. This makes them a rare event.",
    "Saturn radiates two and a half times more energy into space than it receives from the sun.",
    "The temperature inside the Sun can reach 15 million degrees Celsius.",
    "The Moon is moving approximately 3.8 cm away from our planet every year."
];

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);
    var alexa.APP_ID = APP_ID;
    alexa.dynamoDBTableName = 'highLowGuessUsers';
    alexa.registerHandlers(handlers);//separate multiple handlers by ','
    alexa.execute();
};

var states = {
    GUESSMODE: '_GUESSMODE', // User is trying to guess the number.
    STARTMODE: '_STARTMODE'  // Prompt the user to start or restart the game.
};

//Example-- you have handlers. You can have multiple handlers.
var handlers = {
    'LaunchRequest': function () {
        this.emit('HelloWorldIntent');//your intent goes here
    },
//Example
    'GetNewFactIntent': function(){
        var factArr = data;
        var factIndex = Math.floor(Math.random() * factArr.length);
        var randomFact = factArr[factIndex];
        var speechOutput = GET_FACT_MESSAGE + randomFact;
        this.emit(':tellWithCard', speechOutput, SKILL_NAME, randomFact)
    },
//Example
    'HelloWorldIntent': function () {
        this.emit(':tell', 'Hello World!');
    }
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    }
 };

 // card example-goes into response?
 {
  "version": "1.0",
  "response": {
    "outputSpeech": {"type":"PlainText","text":"Text to speak back to the user."},
    "card": {
      "type": "Simple",
      "title": "Example of the Card Title",
      "content": "Example of card content. This card has just plain text content.\nThe content is formatted with line breaks to improve readability."
    }
  }
}

{
  "version": "1.0",
  "response": {
    "outputSpeech": {"type":"PlainText","text":"Your Car-Fu car is on the way!"},
    "card": {
      "type": "Standard",
      "title": "Ordering a Car",
      "text": "Your ride is on the way to 123 Main Street!\nEstimated cost for this ride: $25",
      "image": {
        "smallImageUrl": "https://carfu.com/resources/card-images/race-car-small.png",
        "largeImageUrl": "https://carfu.com/resources/card-images/race-car-large.png"
      }
    }
  }
}
{
  "version": "1.0",
  "response": {
    "outputSpeech": {"type":"PlainText","text":"Please go to your Alexa app and link your account."},
    "card": {
      "type": "LinkAccount"
    }
  }
}
