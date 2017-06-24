# star-gazer
An Alexa App aimed promoting your chanes of star-gazing by providing weather for star gazing hours

### Tech
**Star Gazer** is a Lambda function via AWS. The code is run when invoked. A user enabled the skill "star gazer" in the 
Alexa Skill store, and then the user can trigger Intents with utterances spake thorugh the VUI. 

For example, "Alexa, ask star gazer if the weather is good for star gazing?" will map the words of the user to a specific, 
current day, third party get request to APIxu, a weather API. Then, the code will parse the data returned, and send a
response back to the Alexa 'console'. This will include words that Alexa will speak back to the user based off the users request.

Star Gazer can return current evening condidtions, specific time conditions, specific date evening conditions (where she returns 
all hours that are clear/not clear) or a specific date AND hour within tend days. 

Star Gazer was certified by Amazon Mid-June, 2017.

### Improvements
I would like this skill to also connect another third party API that has astronomical dates associated with dates requested so that users can discover new events in the night sky.
