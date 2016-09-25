var express = require('express'),
    path = require('path'),
    MongoClient = require('mongodb').MongoClient,
    util = require('util').format,
    assert = require('assert'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    httprequest = require('request'),
    http = require('http'),
    //Server = require('mongodb').Server,
    CollectionDriver = require('./collectionDriver').CollectionDriver;
 
// initialize the express engine
var app = express();
app.set('port', process.env.PORT || 3001);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// initialize the mongodb connection setting
//var connectionString = "mongodb://chlee021690:tpxkr369*@ds013232.mlab.com:13232/heroku_4m72s6bv?authMechanism=MONGODB-CR&authSource=db";
var connectionString = "mongodb://heroku_4m72s6bv:126vh6rd1g524h90r4ap1somul@ds013232.mlab.com:13232/heroku_4m72s6bv"
var collectionDriver;
var dbObj;

String.format = function() {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];

    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }
    return theString;
}


// initialize fitbit api information
var baseURL = "https://api.fitbit.com/";

var fitbitURLlist = {
    activities : "1/user/{0}/activities/data/{1}.json",
    activitiesTimeSeries : "1/user/{0}/{1}/date/{2}/{3}.json",

};

var activityTimeSeriesResourcePath = {
    calroies : "activities/calories",
    caloriesBMR :"activities/caloriesBMR",
    steps :"activities/steps",
    distance :"activities/distance",
    floors :"activities/floors",
    elevation :"activities/elevation",
    minutesSedentary :"activities/minutesSedentary",
    minutesLightlyActive :"activities/minutesLightlyActive",
    minutesFairlyActive :"activities/minutesFairlyActive",
    minutesVeryActive :"activities/minutesVeryActive",
    activityCalories :"activities/activityCalories",

    calroiesTracker :"activities/tracker/calories",
    caloriesBMRTracker :"activities/tracker/steps",
    stepsTracker :"activities/tracker/distance",
    floorsTracker :"activities/tracker/floors",
    elevationTracker :"activities/tracker/elevation",
    minutesSedentaryTracker :"activities/tracker/minutesSedentary",
    minutesLightlyActiveTracker :"activities/tracker/minutesLightlyActive",
    minutesFairlyActiveTracker :"activities/tracker/minutesFairlyActive",
    minutesVeryActiveTracker :"activities/tracker/minutesVeryActive",
    activityCaloriesTracker :"activities/tracker/activityCalories"
}


app.use(express.static(path.join(__dirname, 'public')));

// additional functions
app.post('/updateUserInformation', function(req, res) { //A
  debugger;
  // the function to get the user information and update if necessary
  var params = req.body;

  var username = params.username;
  var password = params.password;
  var oauth_token = params.oauth_token;
  var oauth_token_seret = params.oauth_token_seret;
  var oauth_refresh_token = params.oauth_refresh_toekn;

  // find user
  debugger;
  var foundUser;
  MongoClient.connect(connectionString, function(err, db){
    debugger;
    assert.equal(null, err);
    foundUser = db.collection("User").findOne({ username : username, password : password }).pretty();
  });

  if (foundUser != undefined && foundUser != null){
      foundUser.accessToken = oauth_token;
      foundUser.accessTokenSecret = oauth_token_seret;
      foundUser.refreshToken = oauth_refresh_token;

      MongoClient.connect(connectionString, function(err, db) {
        assert.equal(null, err);
        try{
          db.collection("User").updateOne(
            {"_id" : foundUser._id},
            {$set : {"accessToken" : foundUser.accessToken,
                    "accessTokenSecret" : foundUser.accessTokenSecret,
                    "refreshToken" : foundUser.refreshToken,
                    "lastFinishedTime" : new Date()}}
          );

          if (error != undefined && error != null && error != ""){
            res.send(200, "success:"); // _id must be stored in the ios's session object
          }else{
            res.send(200, "error");
            return;
          }
        }catch (e) {
          res.send(200, "error");
          return;
        }

        db.close();
    });

  }else{
      res.send(200, "no-user-data");
  }
});


app.post('/startExercise', function(req, res) { //A
    // the function to get the user information and update if necessary
    var params = req.body;
    var username = params.username;
    var password = params.password;
    var foundUser = db.collection("User").find({username: username, password: password}).pretty()
    // retrieve the data from the table called Result
    var foundResult = null;
    MongoClient.connect(connectionString, function(err, db){
        foundResult = db.collection("Result").find({ userKey : foundUser._id}).pretty()
        if (foundResult != undefined && foundUser != ""){
            res.send(200, foundResult.toString());
        }else{
            res.send(200, "no-result-data");
        }
    });
});

app.get("/test", function(req, res){

    res.send(200, "communication successful!");

});

app.use(function (req,res) {
    res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function(){
    
    // test the connection -- same as the OleDbConnection in ASP.net
    MongoClient.connect(connectionString, function(err, db) {
        if (err) {console.log("error in connecting mongo database. " + err); return;}
        debugger;
        //assert.equal(null, err);
        console.log("Connected correctly to server");
        dbObj = db;
        collectionDriver = new CollectionDriver(dbObj);

        console.log(dbObj);


        db.close();
    });
    
});

module.exports = app;