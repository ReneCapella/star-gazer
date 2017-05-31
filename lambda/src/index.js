////////////////////////////////
//EXTERNAL IMPORTS
////////////////////////////////
const Alexa = require('alexa-sdk');
const request = require('request');
const https = require('https');

////////////////////////////////
// SKILL CONSTANTS
////////////////////////////////
var APP_ID = 'amzn1.ask.skill.92a24c78-c2ca-410f-aa76-9ea83c7dcf55';//Application ID here from Dev Portal
var SKILL_NAME = "Star Gazer";//Skill Name Goes here
var WELCOME_MESSAGE = "I love to gaze at the stars. What is your zipcode?";
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
    },
    'Unhandled': function () {
        this.emit(':ask', HELP_MESSAGE);
    },
    'GetWeatherTodayIntent': function (event) {
        //-------------------Variables-------------------
        var zipcode = this.event.request.intent.slots.Zipcode.value;
        var date = this.event.request.intent.slots.Date.value;
        var time = this.event.request.intent.slots.Time.value;
        var myRequest = this.event.request.intent.slots;

        var clearHours = [];
        var notClearHours = [];
        var alexaClearHours = [];
        var alexaNotClearHours = [];
        var justHour;

        //--------CHECK REQUEST FOR SPECIFIC TIME---------
        var checkForTime = function(){
            console.log(time.length);
            if(time.length > 0){
                console.log(notClearHours);
                console.log('time' + time);
                for (var i = 0; i < notClearHours.length; i++) {
                    if (notClearHours[i] == time){
                          return true;
                    };
                    if (notClearHours[i] == time){
                        return false;
                    };
                };
            } else {
                console.log("no time given");
            };
        };

        //---FUNCTIONS TO CHANGE MAKE HOURS READABLE FOR ALEXA--
        //======================================================
        //---------------makes hour readable by alexa-----------
        var clearNotClearPrep = function(){
        //a function to return a single or double digit only for time
            for (var i = 0; i < clearHours.length; i++) {
                //iterate through all clear hours of the night
                var splitHour = clearHours[i].split(":");
                //splits the hour from the minute at ":"
                var justHour = splitHour[0];
                //grabs the first index, the hour
                makeItAMPM(justHour);
                //sends justHour to makeItAMPM to remove military time and add "am" or "pm"
                alexaClearHours.push(justHour);
                //pushes the readable hour to alexaClearHours array
            };
            for (var i = 0; i < notClearHours.length; i++) {
                var splitHour = notClearHours[i].split(":");
                var justHour = splitHour[0];
                makeItAMPM(justHour);
                alexaNotClearHours.push(justHour);
            };
        };
        //------------------converts military time------------
        var makeItAMPM = function(justHour){
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
        };
        //-------------adds an "and" before last item-------
        var addAnd = function(array){
            if(array.length > 1){
                index = array.length - 1;
                array.splice(index, 0, "and");
            };
        };

        //////////////////////////////////////////////////////
        //----------------END OF FUNCTIONS--------------------
        //------------BEGINNING OF CONDITIONALS---------------
        //////////////////////////////////////////////////////

        if (zipcode.length > 0){
            //-------------------GET REQUEST---------------------
            httpsGetCurrent ( myRequest,  (myResult) => {
                // console.log("sent     : ", myRequest);
                // console.log("received : ", myResult);

                //----------HTTP REQUEST DEPENDENT-VARIABLES---------
                var city = myResult.location.name;
                var weatherCondition = myResult.current.condition.text;
                var localTime = myResult.location.localtime;
                var dayTime = myResult.current.is_day;
                var sunset = myResult.forecast.forecastday[0].astro.sunset
                var byHourToday = myResult.forecast.forecastday[0].hour;
                var byHourTomorrow = myResult.forecast.forecastday[1].hour;
                var totalHoursNightCount = 0;
                var clearConditionsHourCount = 0;

                //----------HTTP REQUEST DEPENDENT-FUNCTIONS----------

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
                //----------------------------------------------------
                //calling functions to prep for output speech to Alexa
                //----------------------------------------------------
                getClearHours();
                clearNotClearPrep();
                addAnd(alexaClearHours);
                addAnd(alexaNotClearHours);
                checkForTime();//checks for a time from request
                console.log("alexa not clear " + alexaNotClearHours);
                console.log("alexa clear " + alexaClearHours);
                console.log("clearHours " + clearHours);
                console.log("notClearHours " + notClearHours);

                if(checkForTime){
                    this.emit(':tell', 'The skies will be clear at ' + time);
                } else if(!checkForTime){
                    this.emit(':tell', 'The skies will be cloudy at ' + time);
                };

                if(time == null && dayTime == 1){
                    if(clearConditionsHourCount/ totalHoursNightCount == 1){
                        this.emit(':tell', "It's currently daytime in " + city + " but it will be clear all night tonight starting at sunset around " + sunset + ".");
                    } else if (clearConditionsHourCount == 0){
                        this.emit(':tell', "It's currently daytime in " + city + ". Tonight will be cloudy. Ask me to check the forecast for another day.");
                    } else if (clearHours.length <= notClearHours.length){
                        this.emit(':tell', "It's currently daytime in " + city + " Tonight, you will have the highest chance of seeing the stars at " + alexaClearHours);
                    } else if (clearHours.length > notClearHours.length){
                        this.emit(':tell', "It's currently daytime in " + city + ". Tonight, it will be mostly clear. It will be difficult to see the stars at " + alexaNotClearHours);
                    };
                } else if(dayTime == 0 && dayTime == 0){
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
            this.emit(':ask', 'What is your Zipcode?');
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
//---------------End of Handlers---------------------

/////////////////////////////////////////////////////
//===================================================
// HTTP GET REQUEST FUNCTIONS
//===================================================
/////////////////////////////////////////////////////
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
