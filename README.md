## The back story

I decided to build a travel web app this morning. I had been looking at the [Sabre Developer Studio](https://developer.sabre.com/) yesterday, and I wanted to get my hands dirty. I had also been looking at [LumX](http://ui.lumapps.com/) a few days ago, an AngularJS web frontend framework that implemented the [Google Material Design](http://www.google.com/design/spec/material-design/introduction.html) guidelines, and wanted to give it a spin. 

**Follow along** to see how I did it - all the way from coding to deployment on EC2, built using ExpressJS & Angular.

## What are we building?
I've always wanted to build an app that allows me to pick where I am, set my dates and a budget - and it tells me where all I could go. Basically, a "I don't care where I go this weekend - just get me out of here" app :) This is what I wanted to build in 2 hours: too ambitious? Perhaps not!

## What you'll need to do this

There are a few things you'll need to get this done in 2 hours - no cheating here, just basic stuff that I had on my machine already.
+ **An editor**: SublimeText, Brackets or my choice - [Atom](https://atom.io/).
+ **An AWS account**: I wont be covering setting up Amazon AWS. You could do this on Digital Ocean, Linode etc. too, so that will work as well.
+ **nodejs**: This is fairly simple to install, so you can do that from [here](https://nodejs.org/)
+ **git & a GitHub account**: This is to commit your code, and store it up on the web. Learn more at [GitHub](www.github.com) if you don't have this set up.


## Getting started: 8:00 am

The first thing I did was sign-up for a [Sabre Developer Studio](https://developer.sabre.com/) account. 

> Sabre is what is called a GDS (Global Distribution System). GDS's aggregate flight, hotel, cruise, taxi and other inventory and provide an interface to travel agents (Expedia, Travelocity) to complete the bookings. Amadeus is the other large GDS, but they aren't as developer friendly as Sabre from what I could see.

Signing up for this was trivial - fill out a [registration form](https://developer.sabre.com/member/register), validated your email address and then get your API key and password.

This took about 5 minutes to complete. After this, I spent some time looking at the REST API's that Sabre exposes. I loved the documentation that Sabre has, and was pleasantly surprised by it, since I had the impression that integrating with something like a GDS would be a painful thing to do.

Specifically I spent some time looking at these two references:

+ [Endpoints & URI's](https://developer.sabre.com/docs/read/rest_basics/endpoints_and_uris) under the REST basics section
+ [REST API's](https://developer.sabre.com/docs/read/REST_APIs) which documents all the APIs that are exposed.

FYI, Sabre also exposes much more functionality - like completing the booking, changing seats, cancellations etc. through a SOAP API, but I wasn't feeling dirty enough to do SOAP!

While looking through these APIs, I identified two APIs that looked useful to me:

1. **GET /v1/lists/supported/cities**: This returns a list of cities which have airports in them.
2. **GET /v1/shop/flights/fares**: This returns a list of flight fares given an origin, start & end dates and a budget - just what I need!

By now, it was about 8:20 am: 100 minutes left!

## Writing some code: 8:20 am

I decided to get my hands dirty with somde code. I found the Sabre had [published](https://github.com/SabreDevStudio/sabre-dev-studio-node) an npm module on GitHub that wraps their API's - handy!

So, to get started I did this:

```
$ cd ~/Lab/
$ mkdir sabrelab
$ cd sabrelab
$ npm install sabre-dev-studio --save-dev
```

Then I cranked up my code editor and wrote some sample code to test the API's out, mostly the same stuff that was there on Sabre's GitHub account:

```javascript,linenums=true
var SabreDevStudio = require('sabre-dev-studio');
var sabre_dev_studio = new SabreDevStudio({
  client_id:     '<your client id here>',
  client_secret: '<your client secret here>',
  uri:           'https://api.test.sabre.com'
});
var options = {};
var callback = function(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(JSON.stringify(JSON.parse(data)));
  }
};
sabre_dev_studio.get('/v1/lists/supported/cities', options, callback);
sabre_dev_studio.get('/v1/shop/flights/fares?origin=NYC&departuredate=2015-05-25&returndate=2015-05-30&maxfare=200', options, callback);
```

Running this was useful, as it gave me the idea of the output I'd get. For the **/cities API call**, the output was like this:
```javascript
{"Cities":[
{"code":"AUH","name":"Abu Dhabi","countryCode":"AE","countryName":"United Arab Emirates","regionName":"Middle East","Links":[{"rel":"airportsInCity","href":"https://api.test.sabre.com/v1/lists/supported/cities/AUH/airports"}]},
{"code":"ALY","name":"Alexandria","countryCode":"EG","countryName":"Egypt","regionName":"Middle East","Links":[{"rel":"airportsInCity","href":"https://api.test.sabre.com/v1/lists/supported/cities/ALY/airports"}]}]}
```

For the **/fares API call**, the output was like this:
```javascript
{"OriginLocation":"NYC","FareInfo":[{"CurrencyCode":"USD","LowestNonStopFare":136.2,"LowestFare":136.2,"DestinationLocation":"BUF","DepartureDateTime":"2015-05-25T00:00:00","ReturnDateTime":"2015-05-30T00:00:00","Links":[{"rel":"shop","href":"https://api.test.sabre.com/v1/shop/flights?origin=NYC&destination=BUF&departuredate=2015-05-25&returndate=2015-05-30&pointofsalecountry=US"}]}]}
```

Brilliant - so, I could now get a list of the airport codes & city names to show as starting cities & I could also get the list of fares & destinations back... the rest of this was going to be a piece of cake!

Time now: 8:40 am, 80 minutes to go...

## Coding up the nodejs / Express server: 8:40 am

I spent some time wondering if I should use [Browserify](http://browserify.org/) on the Sabre npm module, and use it that way. But then I didn't know enough about Browserify, so I said, what the heck, lets just hack up a server real quick.

First, I created the directory structure, fairly simple, and touched a couple of files, package.json and app.js:
```
- sabrelab
--- config
--- www
--- package.json
--- app.js
```

Inside package.json, I put in some standard stuff that I use in every project, and also included sabre-dev-studio. My package.json looked like this:

```javascript,linenum-true
{
  "dependencies": {
    "body-parser": "latest",
    "compression": "latest",
    "cookie-parser": "latest",
    "dateformat": "~1.0.7-1.2.3",
    "errorhandler": "latest",
    "express": "latest",
    "express-session": "latest",
    "http-post": "~0.1.1",
    "memory-cache": "0.0.5",
    "method-override": "latest",
    "morgan": "latest",
    "mstring": "^0.1.2",
    "multer": "^0.1.0",
    "serve-favicon": "latest",
    "string": "~1.8.0",
    "underscore": "latest",
    "validator": "^3.19.1",
    "sabre-dev-studio": "^1.0.1"
  },
  "name": "sabrelab",
  "subdomain": "sabrelab",
  "scripts": {
    "start": "node app.js"
  },
  "version": "0.0.1",
  "engines": {
    "node": "0.8.x"
  }
}    
```

I wasn't sure I needed everything there, but then, *I was working against time*...

Next, I whipped out app.js, mostly using what I'd used on a previous project:

```javascript,linenum=true
(function () {
  'use strict';
  var express = require('express');
  var app = express();

  require('./config/config_app')(app);
  require('./config/config_routes')(app);

  // START THE SERVER
  console.log('STARTING THE SABRE SERVER');
  console.log('-------------------------');
  app.listen(3000);
  console.log('Started the server');
  process.on('uncaughtException', function (error) {
      console.log(error.stack);
      console.log(error);
  });

})();
```

Now, to the config_app.js in the config directory, again, mostly boilerplate stuff from a different project:

```javascript,linenum=true
'use strict';
var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    compression = require('compression'),
    errorhandler = require('errorhandler'),
    multer  = require('multer');

module.exports = function(app) {
  app.use(compression());
  app.use(morgan('dev'));
  app.use(bodyParser());
  app.use(multer());
  app.use(cookieParser('Twyst_2014_Sessions'));

  app.use(methodOverride());

  app.use(express.static(__dirname + '/../www/'));
  app.all("/api/*", function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With, Accept");
      res.header("Access-Control-Allow-Methods", "GET, PUT, POST, HEAD, DELETE, OPTIONS");
      return next();
  });

  app.use(errorhandler({
      dumpExceptions: true,
      showStack: true
  }));

};

```

Now that I had the skeleton of a working server, I had to put in the routes, which is what I did next in config_routes.js. This was all new work, so it required some time and thinking:

This code came first - to initialise the Sabre Dev Studio & authorize against it using the API key:

```javascript,linenum=true
'use strict';
var SabreDevStudio = require('sabre-dev-studio');
var sabreDevStudio = new SabreDevStudio({
  client_id:     '<your client_id>',
  client_secret: '<your client_secret>',
  uri:           'https://api.test.sabre.com'
});
var options = {};
```

This code came next, two small helper functions: the first one (sabreCall) to make a GET call against Sabre, and the next one (response) to send back the response to the HTTP client with either the data returned, or the error:

```javascript,linenum=true
function sabreCall(q, res) {
  sabreDevStudio.get(q, options, function(err, data) {
    response(res, err, data);
  });
}

function response(res, err, data) {
  if (err) {
    res.status(200).send({
      'status': false,
      'message': 'Error',
      'info': err
    });
  } else {
    res.status(200).send({
      'status': true,
      'message': 'Success',
      'info': data
    });
  }
}
```

All this work meant that setting up the API's was going to be trivial - just calling our sabreCall function with the API's we need:

```javascript,linenum=true
module.exports = function(app) {
  
  app.get('/api/v1/cities', function(req,res) {
    sabreCall('/v1/lists/supported/cities', res);
  });

  app.get('/api/v1/places', function(req,res) {
    sabreCall('/v1/shop/flights/fares?origin=' + req.query.origin +
    '&departuredate=' + req.query.departuredate +
    '&returndate=' + req.query.returndate +
    '&maxfare=' + req.query.maxfare, res);
  });
};
```

**That was it** - I started up the server (below), and tried hitting the API's from Chrome by navigating to http://localhost:3000/api/v1/cities, and got back the expected response!
```
$ node app.js
```

Now all that was left was to write the front-end! I looked at my watch, and saw that I'd spent half an hour on the server, so I had 50 minutes left.

## Creating the front-end with LumX and AngularJS: 9:10 am
I had seen [LumX](http://ui.lumapps.com/) a few days ago, and was intrigued by it. I wanted to try out the Google Material Design and see how it felt. At the same time, I wasn't sure I could make it in the time I had left. 

Should I use [Bootstrap](http://getbootstrap.com/) instead? I had used it before, which was a good thing. But then, what the heck, you live only once :) LumX it was going to be.

The first nice thing about LumX was that it was really easy to install, and it also installed everything else I needed. I navigated into the www directory, and got started:

```
$ cd ~/Lab/sabrelab/www
$ bower install lumx
```

This installed LumX. Also, on the **LumX site**(http://ui.lumapps.com/getting-started/installation), they have a great getting started that asked me to add this to my index.html. So, I started up a www/index.html file, and put this into it:



```HTML,linenum=true
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Get Lost</title>
  <link rel="stylesheet" href="bower_components/lumx/dist/lumx.css">
  <link rel="stylesheet" href="bower_components/mdi/materialdesignicons.css">
  <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Roboto:300,400,500,700">
</head>

<body ng-app="getLostApp">

  <script src="bower_components/jquery/dist/jquery.js"></script>
  <script src="bower_components/velocity/velocity.js"></script>
  <script src="bower_components/moment/min/moment-with-locales.js"></script>
  <script src="bower_components/angular/angular.js"></script>
  <script src="bower_components/lumx/dist/lumx.js"></script>
  <script src="./app.js"></script>
</body>
</html>

```

I then created an app.js file (referenced on the last line of the HTML file):
```javascript,linenum=true
angular.module('getLostApp', ['lumx']).
controller('MainCtrl', function($rootScope, $scope, $http) {

  // Get the cities data that I can show in the drop-down
  $http.get('/api/v1/cities').success(function(data) {
    $scope.cities = (JSON.parse(data.info)).Cities;
    console.log($scope.cities);
  }).error(function(err) {
    $scope.error = err;
  });
  
  // Set some prices that I can show in the prices drop-down
  $scope.prices = [
    {show:'$200', value:200},
    {show:'$300', value:300},
    {show:'$400', value:400},
    {show: '$500', value:500}
  ];
  
  // Initialize this with what to show when the page is loaded
  $scope.info = {
    origin: {
      name: 'New York City',
      code: 'NYC'
    },
    maxfare: {
      show: '$500',
      value: 500
    },
    returndate: '2015-05-20',
    departuredate: '2015-05-15'
  };

  // Call the server to get the fares info
  $scope.submit = function() {
    $http.get('/api/v1/places?origin=' + $scope.info.origin.code +
      '&departuredate=' + formatDate($scope.info.departuredate) +
      '&returndate=' + formatDate($scope.info.returndate) +
      '&maxfare=' + $scope.info.maxfare.value).success(function(data) {
        $scope.results = data;
        $scope.data = data.info;
        if ($scope.results.status) {
          $scope.fareinfo = JSON.parse($scope.data).FareInfo;
        } else {
          $scope.error = JSON.parse($scope.data.data).message;
        }
    }).error(function(err) {
      $scope.error = JSON.parse(err.data).message;
    });
  };

  // Helper function from stackoverflow so that I can format the date before sending to the server
  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day].join('-');
  }
});

```

Now, I all I had to do was the UI using LumX, and then hook it up with some simple AngularJS to call my functions. But this is where I got stuck: I'm not great at building the front-end UI, and the LumX documentation wasn't great, especially on how to use the FlexBox (maybe I dont know enough about FlexBox?).

Anyway, not much time to think - it's time to code up this UI! What did I want, let me think about this:

1. A heading
2. A row with two colums: on to select the start city, and the other to put in my budget.
3. A row with a start and end date
4. A submit button
5. A place to show the results - error or success

Taking it one at a time, this is how the UI built up: first the heading:

```HTML
<div class="p+">
  <span class="fs-display-3 display-block">Get Lost</span>
  <span class="fs-title display-block">goofing around with @appa</span>
</div>
```
Then, the reference to the MainCtrl and the row...
```HTML
<div ng-controller="MainCtrl">
  <div class="mt++" flex-container="row" flex-gutter="24">
```
Next, the first column - this one would ask the user to pick a city...

```HTML
<div flex-item>
  <lx-select ng-model="info.origin" placeholder="Starting airport" choices="cities" floating-label>
    <lx-select-selected>
      {{ $selected.name }} - {{ $selected.code }}
    </lx-select-selected>

    <lx-select-choices>
      {{ $choice.name }} - {{ $choice.code }}
    </lx-select-choices>
  </lx-select>
</div>
```
And, the next column, and end the row:
```HTML
<div flex-item>
  <lx-select ng-model="info.maxfare" placeholder="Budget" choices="prices" floating-label>
    <lx-select-selected>
      {{ $selected.show }}
    </lx-select-selected>

    <lx-select-choices>
      {{ $choice.show }}
    </lx-select-choices>
  </lx-select>
</div>
</div>
```

Now, for the next row with the two columns with date pickers:
```HTML
<div class="mt++" flex-container="row" flex-gutter="24">
  <div flex-item>
    <form>
      <lx-date-picker model="info.departuredate" label="Start date" locale="en" fixed-label="true" icon="calendar"></lx-date-picker>
    </form>
  </div>

  <div flex-item>
    <form>
      <lx-date-picker model="info.returndate" label="End date" locale="en" fixed-label="true" icon="calendar"></lx-date-picker>
    </form>
  </div>
</div>
```
Then, a row with the submit button:
```HTML
<div class="mt++" flex-container="row" flex-gutter="24">
  <div flex-item>
    <div flex-container="column" flex-align="space-between center">
      <button class="btn btn--m btn--blue btn--raised" lx-ripple ng-click="submit()">Submit</button>
    </div>
  </div>
</div>
```
Now, for the row that handles the response...
```HTML
<div class="mt++" flex-container="row" flex-gutter="24" flex-wrap ng-show="results">
  <div ng-show="results.status" class="p++">
    <div flex-item="6">
      <span class="fs-title display-block mb">Places you can go...</span>
        <div class="divider divider--dark"></div>
          <ul class="list mt++">
            <div ng-repeat="d in fareinfo | orderBy: 'LowestFare'">
              <li class="list-row list-row--has-separator">
                <div class="list-row__content">
                  <span>{{d.LowestFare}}, {{d.DestinationLocation}}</span>
                </div>
              </li>
            </div>
          </ul>
        </div>
      </div>
  
      <div ng-hide="results.status" class="p++">
        <h2>Error</h2>
          {{error}}
       </div>
    </div>
```

By now, I was running out of time - I had a working app. Everything was working, but I wasn't pleased yet, because:
+ The UI didn't look great. LumX had worked out well for the date picker & the drop-down list, but I couldn't get the hang of how to space things around.
+ The results, when returned, didn't have the full information - it had only the airport code & the price, not the full airport name etc. It also didn't look very good :(

Here's how it was looking by now:

![ABC](https://www.anony.ws/i/2015/05/12/getlost.png)

Anyway, on to the next step - deploying to AWS. 20 minutes to go!!

## GitHub, and deploying to AWS: 9:40 am

The next 20 minutes went by in a rush... first of all, I committed to git, and uploaded to GitHub:

```
$ cd ~/Lab/sabrelab
$ git init .
$ git add .
$ git commit -am "Initial commit for Sabre Lab"
```

Then I went to GitHub and created a new repo at https://github.com/arunr/sabrelab. I went back to the command line and pushed my code up to GitHub, so I could later easily get to it from AWS:

```
$ git remote add origin https://github.com/arunr/sabrelab.git
$ git push origin master
```

I then went over to AWS, and created a micro-instance of Ubuntu. After downloading the PEM file, I logged in to the instance, and installed node, git and forever (so that I could keep my server running):

```
$ ssh -i sabrelab.pem ubuntu@<your server IP here>

Then on the Ubuntu AWS instance:

$ curl -sL https://deb.nodesource.com/setup | sudo bash -
$ sudo apt-get install -y nodejs
$ sudo apt-get install git
$ git clone https://github.com/arunr/sabrelab.git
$ sudo npm install -g forever
$ cd ~/sabrelab
$ sudo forever start app.js
```

After this, I had to do two things, which I had forgotten:
1. Change the port in app.js from 3000 to 80.
2. Add my EC2 instance to a security group that allowed for inbound access to the server on HTTP port 80.

Once I had done this, I had my public facing server: at http://52.10.111.167.

I looked at my watch, and it was 9:57 am... I had made it with just enough time to give me server an spin!

## Closing thoughts
A few thoughts to close out - just my own learnings from the morning:
+ I proved to myself that it is possible to create a web app from end-to-end in 2 hours (this was important for me, because I haven't had any *code flow* for a while now!)
+ More importantly, I managed to dabble with a few new things and see how they fit - Sabre Developer API's and LumX.
+ On the Sabre Developer APIs - I found this easy to start, well documented, useful and something I might use in a project in the future. The only catch was that this is all against the Sabre Test API's and I couldn't find any documentation on the pricing of the PROD API's.
+ On LumX - I found the UI beautiful in the examples, but couldn't find enough documentation to make my own front-end UI look good in the half-hour I spent with it. So, I'm not dissing it, but it definitely felt hard - maybe I just need to put in more time into it.
+ Next steps:
    + Clean up the UI and make it look pretty
    + Show more full results, with a link to booking as well
    + Connect to the Sabre PROD API's
    + Use geo-location to auto-fill the start city
    + Wrap the entire thing in Ionic so there is a phone app version of this

That's it - hope you had fun, and look forward to your comments! 
[@appa](http://twitter.com/appa)








