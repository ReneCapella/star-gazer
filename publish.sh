rm index.zip
cd lambda
zip –X –r ../index.zip *
cd ..
aws lambda update-function-code --function-name StarGazerLambda --zip-file fileb://index.zip

# change this line 5 "MyLambdaFunction" to the name of my lambda function for the project
