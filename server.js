
var port = 10280;
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app  = express();
var http = require('http').createServer(app);
var route = require('./modules/route');

app.set('views', path.join(__dirname, 'public/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname,'bower_components')));

app.use(function(req,res,next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(function(req,res,next){
    log(req);
    next();
});

app.use('/',route);

http.listen(port, function(){
    console.log('Server listening on '+ port +' port');
});

function log(req){
    // console.log(req.url.green);
    // console.log(req.body);
}
