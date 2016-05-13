'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');

var months={ 0:"January",  1:"February",  2:"March", 3:"April",4:"May",5:"June", 6:"July", 7:"August" ,8:"September",9:"October" ,10:"November",  11:"December"};
var months_reverse={ "January":0, "February":1,  "March":2, "April":3,"May":4,"June":5, "July":6, "August":7 ,"September":8,"October":9 ,"November":10, "December":11};

var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}));


app.get('*', function(req, res){
var unix_ts_match = /^\d+$/ ;	
var reguler_date_match =/^(\w+)%20(\d{1,2}),%20(\d{2,4})$/ ;      //!!! to test keys !
if ( unix_ts_match.test(req.url.slice(1)) )
	{	
	var date_request = parseInt(req.url.slice(1));	  //strip the slash in the begining
	//res.write('date num: '+date_request+'\n');
	var date = new Date( date_request*1000);
	var output = '{"unix":'+date_request+', "natural": '+months[date.getMonth()]+" "+date.getDate()+ ", "+date.getFullYear()+' }'
	}
 // December%2015,%202015	
 	
else if (reguler_date_match.test(req.url.slice(1)))

{
	var date_array =  reguler_date_match.exec(req.url.slice(1))
	if (!(date_array[1] in months_reverse))
	{
	 output = '{ "unix": null, "natural": null }';
	}
	
	else
	{
	var utcDate = new Date(Date.UTC(date_array[3], months_reverse[date_array[1]], date_array[2], 0, 0, 0));	
	var seconds = utcDate.getTime() / 1000
	output ='{"unix":'+seconds.toString()+', "natural": '+months[utcDate.getMonth()]+" "+utcDate.getDate()+ ", "+utcDate.getFullYear()+' }'
	}
}
else
{
	output = '{ "unix": null, "natural": null }';
	
}
res.write(  output    )	;
res.end();
});


       


app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});