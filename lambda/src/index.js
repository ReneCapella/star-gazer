////////////////////////////////
//EXTERNAL IMPORTS
////////////////////////////////
const Alexa = require('alexa-sdk');
const request = require('request');
const https = require('https');

////////////////////////////////
// Global Variables
////////////////////////////////
var clearHours = [];
var notClearHours = [];
var alexaClearHours = [];
var alexaNotClearHours = [];
var conditionAtTime;
var justHour;
var totalHoursNightCount = 0;
var clearConditionsHourCount = 0;
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'Decembner'];
var ordinals = ['first','second','third','fouth','fifth','sixth','seventh','eighth', 'ninth','tenth','eleventh','twelveth','thirteenth','fourteenth','fifteenth','sixteenth','seventeenth','eighteeth','nineteenth','twentith','twenty first', 'twenty second', 'twenty third','twenty fourth','twenty fifth', 'twenty sixth', 'twenty seventh', 'twenty eigth','twenty ninth','thirtith','thirty first'];

//---FUNCTIONS TO CHANGE MAKE HOURS READABLE FOR ALEXA--
//======================================================
//---------------makes hour readable by alexa-----------
var clearNotClearPrep = function(){
//a function to return a single or double digit only for time
    for (var i = 0; i < clearHours.length; i++) {
        //iterate through all clear hours of the night
        var justHour = clearHours[i].split(":");
        //splits the hour from the minute at ":"
        var justHour = justHour[0];
        //grabs the first index, the hour
        // makeItAMPM(justHour);
        //sends justHour to makeItAMPM to remove military time and add "am" or "pm"
        alexaClearHours.push(makeItAMPM(justHour));

        //pushes the readable hour to alexaClearHours array
    };
    for (var i = 0; i < notClearHours.length; i++) {
        var splitHour = notClearHours[i].split(":");
        var justHour = splitHour[0];

        alexaNotClearHours.push(makeItAMPM(justHour));
    };
};
//------------------converts military time------------
var makeItAMPM = function(hour){
    if(hour > 12){
        hour = hour - 12 + "pm";
    } else {
        if(hour < 10 || hour == 0){
            hour = hour.split("");
            hour = hour.splice(1, 1);
            if(hour == 0){
                hour = "midnight";
            } else {
                hour = hour + "am";
            };
        };
    };
    return hour;
};
//-------------adds an "and" before last item-------
var addAnd = function(array){
    if(array.length > 1){
        index = array.length - 1;
        array.splice(index, 0, "and");
    };
};
//separate the clear hours of the night from the not clear hours of the night
var getClearHours = function(arr1, arr2){
    for (var i = 0; i < arr1.length; i++) {
        var forecastTime = arr1[i].time;
        var acceptIt = function(){
            var breakUpDateTime = forecastTime.split(" ");
            var breakUpHourMin = breakUpDateTime[1].split(":");
            var getHour = breakUpHourMin[0];
            if(getHour > 15){
                return true;
            };
        };
        if( (arr1[i].is_day == 0) && (acceptIt()) ){
            totalHoursNightCount++;
            if(arr1[i].condition.text != 'Clear' ){
                var timeArray = arr1[i].time.split(" ");
                notClearHours.push(timeArray[1]);
            } else if(arr1[i].condition.text == 'Clear'){
                clearConditionsHourCount++;
                var timeArray = arr1[i].time.split(" ");
                clearHours.push(timeArray[1]);
            };
        };
    };
    for (var i = 0; i < arr2.length; i++) {
        var forecastTime = arr2[i].time;
        var acceptIt = function(){
            var breakUpDateTime = forecastTime.split(" ");
            var breakUpHourMin = breakUpDateTime[1].split(":");
            var getHour = breakUpHourMin[0];
            if(getHour < 9){
                return true;
            };
        };
        if( (arr2[i].is_day == 0) && (acceptIt()) ){
            totalHoursNightCount++;
            if(arr2[i].condition.text != 'Clear' ){
                var timeArray = arr2[i].time.split(" ");
                notClearHours.push(timeArray[1]);
            } else if(arr2[i].condition.text == 'Clear'){
                clearConditionsHourCount++;
                var timeArray = arr2[i].time.split(" ");
                clearHours.push(timeArray[1]);
            };
        };
    };
};


////////////////////////////////
// SKILL CONSTANTS
////////////////////////////////
var APP_ID = 'amzn1.ask.skill.92a24c78-c2ca-410f-aa76-9ea83c7dcf55';//Application ID here from Dev Portal
var SKILL_NAME = "Star Gazer";//Skill Name Goes here
var WELCOME_MESSAGE = "I <emphasis level='strong'>love</emphasis> to gaze at the stars. Please tell me your zipcode where you'd like to start gazing.";
var HELP_MESSAGE = "You can ask if the weather good for star gazing tonight or another day within the ten day forecast. You can also say exit... What can I help you with?";
var HELP_REPROMPT = "Try this: is the sky clear for star gazing? and add your zipcode.";
var STOP_MESSAGE = "Happy star gazing! Goodbye!";


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
    'GetZipcodeIntent': function (event) {
        var zipcode = this.event.request.intent.slots.Zipcode.value;
        this.attributes['zipcode'] = zipcode;
        this.emit(':ask', "Thanks! Say 'general forecast' for an overview of the evening, or tell me a specific time,like: is the weather good for star gazing at eleven pm, or can I star gaze next thursday at midnight.");
    },
    'GetWeatherDateAndTimeIntent': function () {
        var date = this.event.request.intent.slots.Date.value;
        var time = this.event.request.intent.slots.Time.value;

        var zipcode = '';
        if (this.attributes['zipcode']) {
            zipcode = this.attributes['zipcode'];
        } else if(this.event.request.intent.slots.Zipcode.value){
            zipcode = this.event.request.intent.slots.Zipcode.value;
            this.attributes['zipcode'] = zipcode;
        }else{
            this.emit(':ask', 'I dont know your zipcode yet. You can say: I want to star gaze in...followed by your zipcode and, if you want, at a specific hour. Otherwise, I will tell you the general forecast.');
        };
        var myRequest = zipcode;
        //HTTP GET REQUEST FUNCTION--------------------------
        httpsGet ( myRequest,  (myResult) => {
        // console.log("sent from Date&Time Intent        : ", myRequest);
        // console.log("received back for Date&Time Intent: ", myResult);
            var speechOutput;
            var getDateTimeMatch = function(){
                var hours = [];
                var indexOfDate;
                for (var i = 0; i < myResult.forecast.forecastday.length; i++) {
                    if(myResult.forecast.forecastday[i].date == date){
                        for (var j = 0; j < myResult.forecast.forecastday[i].hour.length; j++) {
                            if(myResult.forecast.forecastday[i].hour[j].is_day == 0){
                                var month;
                                var day;
                                var newTime;
                                resultTimeSplit = myResult.forecast.forecastday[i].hour[j].time.split(" ");
                                if (resultTimeSplit[1] == time) {
                                    //convert time and date to be read by alexa
                                    time = time.split(":");
                                    time = time[0];
                                    newTime = makeItAMPM(time);
                                    date = date.split("-");
                                    month = months[date[1] - 1];
                                    day = ordinals[date[2] - 1];

                                    speechOutput = "The weather on " + month +" "+ day + " at " + newTime + " will be " + myResult.forecast.forecastday[i].hour[j].condition.text;
                                    return speechOutput;
                                };
                            } else {
                                speechOutput = "The hour you requested is during the day.";
                            };
                        };
                    } else {
                        speechOutput = "The date you've requested may be beyond my 10 day forecast window.";
                    };
                };
            };
            getDateTimeMatch()
            this.emit(':tell', speechOutput);
        });

    },
    'GetWeatherDateIntent': function () {
        var date = this.event.request.intent.slots.Date.value;
        var zipcode = '';
        if (this.attributes['zipcode']) {
            zipcode = this.attributes['zipcode'];
        } else if(this.event.request.intent.slots.Zipcode.value){
            zipcode = this.event.request.intent.slots.Zipcode.value;
            this.attributes['zipcode'] = zipcode;
        }else{
            this.emit(':ask', 'I dont know your zipcode yet. You can say: I want to star gaze in...followed by your zipcode and, if you want, at a specific hour. Otherwise, I will tell you the general forecast.');
        };
        var myRequest = zipcode;

        httpsGet ( myRequest,  (myResult) => {
        // console.log("sent from Time        : ", myRequest);
        // console.log("received back for Time: ", myResult);
            var speechOutput;
            var getDateMatch = function(){
                for (var i = 0; i < myResult.forecast.forecastday.length; i++) {
                    if(myResult.forecast.forecastday[i].date == date){
                        date = date.split("-");
                        var month = months[date[1] - 1];
                        var day = ordinals[date[2] - 1];
                        var sunset = myResult.forecast.forecastday[i].astro.sunset;
                        if(myResult.forecast.forecastday[i].day.condition.text == "clear"){
                            speechOutput = "The forecast for " + month + " " + day + " is: " +   myResult.forecast.forecastday[i].day.condition.text + ". You can start star gazing after " + sunset + ".";
                            return speechOutput;
                        } else if(myResult.forecast.forecastday[i].day.condition.text != "clear"){
                            speechOutput = "The forecast for " + month + " " + day + " is: " +   myResult.forecast.forecastday[i].day.condition.text + ". Not the best forecast for star gazing...";
                            return speechOutput
                        };

                    }else {
                        speechOutput = "The date you've requested may be beyond my 10 day forecast window.";
                    };
                };
            };
            getDateMatch()
            this.emit(':tell', speechOutput);
        });
    },
    'GetWeatherTimeIntent': function () {
        var time = this.event.request.intent.slots.Time.value;
        this.attributes['time'] = time;
        var zipcode = '';
        if (this.attributes['zipcode']) {
            zipcode = this.attributes['zipcode'];
        } else if(this.event.request.intent.slots.Zipcode.value){
            zipcode = this.event.request.intent.slots.Zipcode.value;
            this.attributes['zipcode'] = zipcode;
        }else{
            this.emit(':ask', 'I dont know your zipcode yet. You can say: I want to star gaze in...followed by your zipcode and, if you want, at a specific hour. Otherwise, I will tell you the general forecast.');
        };
        var myRequest = zipcode;

        //--------CHECK REQUEST FOR SPECIFIC TIME---------
        if(time.length > 0){
            httpsGet ( myRequest,  (myResult) => {
            // console.log("sent from Time        : ", myRequest);
            // console.log("received back for Time: ", myResult);
                var speechOutput;
                var isDay = myResult.current.is_day;
                var byHourToday = myResult.forecast.forecastday[0].hour;
                var byHourTomorrow = myResult.forecast.forecastday[1].hour;
                var sunset = myResult.forecast.forecastday[0].astro.sunset;

                getClearHours(byHourToday, byHourTomorrow);
                clearNotClearPrep();
                addAnd(alexaClearHours);
                addAnd(alexaNotClearHours);
                var getTime = function(){
                    for (var i = 0; i < byHourToday.length; i++) {
                        if(byHourToday[i].time.includes(time)){
                            if(byHourToday[i].is_day == 0){
                                time = time.split(":");
                                time = time[0];
                                newTime = makeItAMPM(time);

                                speechOutput = "At " + newTime + " the weather condition is forecasted as " + byHourToday[i].condition.text;
                                return speechOutput;
                            };
                        } else {
                            speechOutput = "The hour you requested is during the day.";
                        };
                    };
                };
                getTime();
                this.emit(":tell", speechOutput);
            });
        } else {
            this.emit(':ask', HELP_MESSAGE, STOP_MESSAGE);
        };
    },
    'GetWeatherTodayIntent': function (event) {
        //-------------------Variables-------------------
        var zipcode = '';
        if (this.attributes['zipcode']) {
            zipcode = this.attributes['zipcode'];
        } else if(this.event.request.intent.slots.Zipcode.value){
            zipcode = this.event.request.intent.slots.Zipcode.value;
        }else{
            this.emit(':ask', 'I dont know your zipcode yet. You can say: I want to star gaze in...followed by your zipcode and, if you want, at a specific hour. Otherwise, I will tell you the general forecast.');
        };
        var myRequest = zipcode;

        //////////////////////////////////////////////////////
        //------------BEGINNING OF CONDITIONALS---------------
        //////////////////////////////////////////////////////

        if (zipcode.length > 0){
            //-------------------GET REQUEST---------------------
            httpsGet ( myRequest,  (myResult) => {
                //----------HTTP REQUEST DEPENDENT-VARIABLES---------
                var city = myResult.location.name;
                var weatherCondition = myResult.current.condition.text;
                var localTime = myResult.location.localtime;
                var isDay = myResult.current.is_day;
                var sunset = myResult.forecast.forecastday[0].astro.sunset
                var byHourToday = myResult.forecast.forecastday[0].hour;
                var byHourTomorrow = myResult.forecast.forecastday[1].hour;
                //----------------------------------------------------
                //calling functions to prep for output speech to Alexa
                //----------------------------------------------------
                getClearHours(byHourToday, byHourTomorrow);
                clearNotClearPrep();
                addAnd(alexaClearHours);
                addAnd(alexaNotClearHours);//checks for a time from request

                //-------------------CONDITIONALS---------------------
                //----------------AND OUTPUTS-SPEECH------------------

                if(isDay == 1){
                    if(clearConditionsHourCount/ totalHoursNightCount == 1){
                        var sunset = sunset.split(":");
                        var sunset = sunset[0];
                        this.emit(':tell', "It's currently day time in " + city + " Tonight will be clear all night starting at sunset around " + sunset + "pm.");
                    } else if (clearConditionsHourCount == 0){
                        this.emit(':tell', "Tonight will be cloudy with no opportunities to star gaze.");
                    } else if (clearHours.length <= notClearHours.length){
                        this.emit(':tell', "It's currently daytime in " + city + ". Tonight, you will have the highest chance of seeing the stars at " + alexaClearHours);
                    } else if (clearHours.length > notClearHours.length){
                        this.emit(':tell', "It's currently daytime in " + city + ". It will be mostly clear tongight. There is forecasted overcast or clouds at " + alexaNotClearHours);
                    };
                } else if(isDay == 0){

                    if(clearConditionsHourCount/ totalHoursNightCount == 1){
                        console.log(alexaClearHours);
                        console.log(alexaNotClearHours);
                        this.emit(':tell', "It will be clear all night tonight in " + city);
                    } else if (clearConditionsHourCount == 0){
                        console.log(alexaClearHours);
                        console.log(alexaNotClearHours);
                        this.emit(':tell', "Tonight will be cloudy in " + city + ". Ask me to check the forecast for another day. ");
                    } else if (clearHours.length <= notClearHours.length){
                        console.log(alexaClearHours);
                        console.log(alexaNotClearHours);
                        this.emit(':tell', "You will have the highest chance of star gazing  tonight at " + alexaClearHours + " in " + city);
                    } else if (clearHours.length > notClearHours.length){
                        console.log(alexaClearHours);
                        console.log(alexaNotClearHours);
                        this.emit(':tell', "It will be mostly clear tonight. There is forecasted overcast or clouds at " + alexaNotClearHours);
                    };
                };
            });
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
var httpsGet = function (myData, callback) {

    var options = {
        host: 'api.apixu.com',
        port: 443,
        path: '/v1/forecast.json?key=' + apiKey +'&q=' + encodeURIComponent(myData) + '&days=10',
        method: 'GET'
    };

    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {

            var pop = JSON.parse(returnData);

            callback(pop);  // this will execute whatever function the caller defined, with one argument
        });
    });
    req.end();

};
