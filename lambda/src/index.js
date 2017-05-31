////////////////////////////////
//EXTERNAL IMPORTS
////////////////////////////////
const Alexa = require('alexa-sdk');
const request = require('request');
const https = require('https');

////////////////////////////////
//TEXT STRINGS-modify to change behavior of Lambda
////////////////////////////////
var responseDataArray = [];

////////////////////////////////
// SKILL CONSTANTS
////////////////////////////////
var APP_ID = 'amzn1.ask.skill.92a24c78-c2ca-410f-aa76-9ea83c7dcf55';//Application ID here from Dev Portal
var SKILL_NAME = "Star Gazer";//Skill Name Goes here
var WELCOME_MESSAGE = "I love to gaze at the stars. What is your zipcode?";
// var WELCOME_MESSAGE = {
//         outputSpeech: {
//             type: "PlainText",
//             text: "I love to gaze at the stars. What is your zipcode?"
//         },
//         card: {
//             type: "Simple",
//             title: "Test",
//             content: "Hello World"
//         },
//         shouldEndSession: false
//     };
var HELP_MESSAGE = "You can ask is the weather good for star gazing in a certain zipcode, or, you can say exit... What can I help you with?";
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
        var speechOutput = WELCOME_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
        // var zipcode = this.event.request.intent.slots.Zipcode.value;
        // if (zipcode.length > 0){
        //     GetWeatherTodayIntent()
        // };
    },
    'Unhandled': function () {
        this.emit(':ask', HELP_MESSAGE);
    },
    'GetWeatherTodayIntent': function (event) {

        var zipcode = this.event.request.intent.slots.Zipcode.value;

        var date = this.event.request.intent.slots.Date.value;
        var time = this.event.request.intent.slots.Time.value
        if (zipcode.length > 0){
            var clearHours = [];
            var notClearHours = [];
            var alexaClearHours = [];
            var alexaNotClearHours = [];

            var alexifyHours = function(){
                for (var i = 0; i < clearHours.length; i++) {
                    var splitHour = clearHours[i].split(":");
                    var justHour = splitHour[0];
                    if(justHour > 12){
                        justHour = justHour - 12 + "pm";
                    } else {
                        if(justHour < 10 || justHour == 0){
                            justHour = justHour.split("");
                            justHour = justHour.splice(1, 1);
                            if(justHour == 0){
                                justHour = "midnight";
                            } else {
                                justHour = justHour + "am"
                            };
                        };
                    };
                    alexaClearHours.push(justHour);
                };
                for (var i = 0; i < notClearHours.length; i++) {
                    var splitHour = notClearHours[i].split(":");
                    var justHour = splitHour[0];

                    if(justHour > 12){
                        justHour = justHour - 12 + "pm";
                    } else {
                        if(justHour < 10 || justHour == 0){
                            justHour = justHour.split("");
                            justHour = justHour.splice(1, 1);
                            if(justHour == 0){
                                justHour = "midnight";
                            } else {
                                justHour = justHour + "am"
                            };
                        };
                    };
                    alexaNotClearHours.push(justHour);
                };
                var addAnd = function(array){
                    if(array.length > 1){
                        index = array.length - 1;
                        array.splice(index, 0, "and");
                        console.log(array);
                    };
                };
                addAnd(alexaClearHours);
                addAnd(alexaNotClearHours);

            };

            var myRequest = this.event.request.intent.slots;
            var myRequestZipcode = zipcode;
            var myRequestTime = time;
            console.log(myRequestTime);
            httpsGetCurrent ( myRequest,  (myResult) => {
                console.log("sent     : ", myRequest);
                // console.log("received : ", myResult);
                var city = myResult.location.name;
                //IF TIME is not NULL, iterate through clear and notClearHours looking for a match to myRequestTime.  Maybe convert request time to the format used in the clearHour/notClearHour format (HH:MM).find a match: emite conditions for that hour. If the hour requested is not a night hour, tell user the hour requested is not a night hour.


                var weatherCondition = myResult.current.condition.text;
                var localTime = myResult.location.localtime;
                var dayTime = myResult.current.is_day;
                var sunset = myResult.forecast.forecastday[0].astro.sunset
                var byHourToday = myResult.forecast.forecastday[0].hour;
                var byHourTomorrow = myResult.forecast.forecastday[1].hour;
                var totalHoursNightCount = 0;
                var clearConditionsHourCount = 0;

                var getClearHours = function(){
                    for (var i = 0; i < byHourToday.length; i++) {
                        var forecastTime = byHourToday[i].time;
                        var acceptIt = function(){
                            var breakUpDateTime = forecastTime.split(" ");
                            var breakUpHourMin = breakUpDateTime[1].split(":");
                            var getHour = breakUpHourMin[0];
                            if(getHour > 15){
                                return true;
                            };
                        };
                        if( (byHourToday[i].is_day == 0) && (acceptIt()) ){
                            totalHoursNightCount++;
                            if(byHourToday[i].condition.text != 'Clear' ){
                                var timeArray = byHourToday[i].time.split(" ");
                                notClearHours.push(timeArray[1]);
                            } else if(byHourToday[i].condition.text == 'Clear'){
                                clearConditionsHourCount++;
                                var timeArray = byHourToday[i].time.split(" ");
                                clearHours.push(timeArray[1]);

                            };
                        };
                    };
                    for (var i = 0; i < byHourTomorrow.length; i++) {
                        var forecastTime = byHourTomorrow[i].time;
                        var acceptIt = function(){
                            var breakUpDateTime = forecastTime.split(" ");
                            var breakUpHourMin = breakUpDateTime[1].split(":");
                            var getHour = breakUpHourMin[0];
                            if(getHour < 9){
                                return true;
                            };
                        };
                        if( (byHourTomorrow[i].is_day == 0) && (acceptIt()) ){
                            totalHoursNightCount++;
                            if(byHourTomorrow[i].condition.text != 'Clear' ){
                                var timeArray = byHourTomorrow[i].time.split(" ");
                                notClearHours.push(timeArray[1]);

                            } else if(byHourTomorrow[i].condition.text == 'Clear'){
                                clearConditionsHourCount++;
                                var timeArray = byHourTomorrow[i].time.split(" ");
                                clearHours.push(timeArray[1]);

                            };
                        };
                    };
                };
                //IF TIME is not NULL, iterate through clear and notClearHours looking for a match to myRequestTime.  Maybe convert request time to the format used in the clearHour/notClearHour format (HH:MM).find a match: emite conditions for that hour. If the hour requested is not a night hour, tell user the hour requested is not a night hour. make a function: check for date: if date is true, emit hour requested.

                if(dayTime == 1){
                    getClearHours();
                    alexifyHours();
                    console.log("alexa not clear " + alexaNotClearHours);
                    console.log("alexa clear " + alexaClearHours);
                    console.log("clearHours " + clearHours);
                    console.log("notClearHours " + notClearHours);

                    if(clearConditionsHourCount/ totalHoursNightCount == 1){
                        this.emit(':tell', "It's currently daytime in " + city + " but it will be clear all night tonight starting at sunset around " + sunset + "." + clearHours);
                    } else if (clearConditionsHourCount == 0){
                        this.emit(':tell', "It's currently daytime in " + city + ". Tonight will be cloudy. Ask me to check the forecast for another day. ");
                    } else if (clearHours.length <= notClearHours.length){
                        this.emit(':tell', "It's currently daytime in " + city + " but I looked ahead at the forecast tonight. You will have the highest chance of star gazing at " + alexaClearHours);
                    } else if (clearHours.length > notClearHours.length){
                        this.emit(':tell', "It's currently daytime in " + city + " but I looked ahead at the forecast. It will be mostly clear tonight. You're least likely to see the stars at " + alexaNotClearHours);
                    };
                } else if(dayTime == 0){
                    console.log("night");
                    getClearHours();
                    alexifyHours();
                    console.log("alexa not clear " + alexaNotClearHours);
                    console.log("alexa clear " + alexaClearHours);
                    console.log("clearHours " + clearHours);
                    console.log("notClearHours " + notClearHours);
                    // checkForDate();//checks for a date from request
                    // if( checkForTime() ){
                    //     for (var i = 0; i < clearHours.length; i++) {
                    //         clearHours[i];
                    //     }
                    // };

                    if(clearConditionsHourCount/ totalHoursNightCount == 1){
                        this.emit(':tell', "It will be clear all night tonight.");
                    } else if (clearConditionsHourCount == 0){
                        this.emit(':tell', "Tonight will be cloudy. Ask me to check the forecast for another day. ");
                    } else if (clearHours.length <= notClearHours.length){
                        this.emit(':tell', "You will have the highest chance of star gazing at " + alexaClearHours);
                    } else if (clearHours.length > notClearHours.length){
                        this.emit(':tell', "It will be mostly clear tonight. You're least likely to see the stars at " + alexaNotClearHours);
                    };
                };
            });
        } else if(zipcode == null || zipcode == undefined){
            this.emit(':ask', 'What is the zipcode you want to star gaze in?');
        };
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
var httpsGetCurrent = function (myData, callback) {

    // Update these options with the details of the web service you would like to call
    console.log('zipcode in request = ', myData.Zipcode.value);
    var options = {
        host: 'api.apixu.com',
        port: 443,
        path: '/v1/forecast.json?key=' + apiKey +'&q=' + encodeURIComponent(myData.Zipcode.value) + '&days=5',
        method: 'GET'
    };

    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";


        res.on('data', chunk => {

            returnData = returnData + chunk;
            // console.log("return data from API" + returnData);
        });

        res.on('end', () => {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed data

            var pop = JSON.parse(returnData);
            // console.log(pop);
            // console.log("pop", pop.current.condition.text);

            callback(pop);  // this will execute whatever function the caller defined, with one argument

        });

    });
    req.end();

}

var httpsGetForecast = function (myData, callback) {

    // Update these options with the details of the web service you would like to call
    var options = {
        host: 'api.apixu.com',
        port: 443,
        path: '/v1/forecast.json?key=' + apiKey +'&q=' + encodeURIComponent(myData) + '&days=5',
        method: 'GET'
    };

    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = [];


        res.on('data', chunk => {

            returnData = returnData + chunk;
            // console.log("return data from API" + returnData);
        });

        res.on('end', () => {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed data

            var pop = JSON.parse(returnData);
            // console.log("pop", pop.current.condition.text);

            callback(pop);  // this will execute whatever function the caller defined, with one argument

        });

    });
    req.end();

}
