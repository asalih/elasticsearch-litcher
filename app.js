var w = require("./watcher");
var express = require("express");
var bodyParser = require("body-parser");
var jade = require("jade");

var app = express();

app.set('views', './view');
app.set('view engine', 'jade');  
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get("/", function name(req, res) {
    var files = watcher.getWatches();
    res.render("index", {files: files, intervals: watcher.intervals });
    //res.render("index", { title: 'The index page!' });
});

app.get("/getRow", function name(req, res) {
    var k = req.query.key;
    
    var fileBody = watcher.readRawWatchFile(req.query.key);
    var fc = { key: k, body: fileBody, interval: JSON.parse(fileBody).interval };
    
    res.render("tablerow", {fl: fc, intervals: watcher.intervals });
    //res.render("index", { title: 'The index page!' });
});

app.post("/createOrUpdateWatch", function name(req, res) {
    if(!watcher.isJson(req.body.body)){
        res.send({e: "invalid json"});
    }
    else{
        var result = watcher.createOrUpdateWatch(req.body.key, req.body.body);
        res.send(true);
    }
    
});

app.post("/delete", function name(req, res) {
    var result = watcher.deleteWatch(req.body.key);
    res.send(result);
});

app.post("/start", function name(req, res) {
    var result = watcher.createInterval(req.body.key);
    res.send(result);
});

app.post("/stop", function name(req, res) {
    var result = watcher.clearInterval(req.body.key);
    res.send(result);
});
 
app.listen(4000);