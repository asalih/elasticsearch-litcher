var fs = require("fs");
var http = require("http");

var path = __dirname + "/job/"

global.watcher = module.exports = {
    intervals: {},
    getWatches: function () {
         if(fs.existsSync(path)){
            var files = fs.readdirSync(path);
            var flWBody = [];
            
            for(var i =0;i < files.length; i++){    
                var k = files[i].replace(".json", "");
                var fileBody = this.readRawWatchFile(k);
                var fc = { key: k, body: fileBody, interval: JSON.parse(fileBody).interval };
                flWBody[i] = fc;
            }
            
            return flWBody;
        }
    },
    createInterval: function (key) {
        try {
            var intervalId = this.intervals[key];
            if(intervalId == null){
                var options = this.readWatchFile(key);
                
                if(options.interval < 1000){
                    options.interval = 1000;
                }
                
                intervalId = setInterval(this.intervalTick, options.interval, options);
            
                this.intervals[key] = intervalId;
            }
            
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    intervalTick: function(opt){
        var query = JSON.stringify(opt.query);
        
        var options = {
            hostname: opt.hostname,
            port: opt.port,
            path: opt.path,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Content-Length": query.length,
                "Accept": "application/json, text/javascript, */*; q=0.01"
            }
            };
            
            var req = http.request(options, function(res){
                console.log(`STATUS: ${res.statusCode}`);
                console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                res.setEncoding('utf8');
                
                var responseBody = "";
                res.externalData = this.externalData;
                res.on('data', function(chunk) {
                    responseBody += chunk;
                });
                
                res.on("end", function(ie){
                    var extData = this.externalData;
                    var result = JSON.parse(responseBody);
                    var conditionResult = eval(extData.condition);
                    
                });
            });
            
            req.externalData = opt;
            
        req.on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
        });

        // write data to request body
        req.write(query);
        req.end();
        
    },
    clearInterval: function (key) {
        try {
            var intervalId = this.intervals[key];
            if(intervalId != null){
                clearInterval(intervalId);
                this.intervals[key] = null;
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    createOrUpdateWatch: function (key, body) {
        try {
            
            var pc = this.cpath(key);
            fs.writeFileSync(pc, body);
            
            var exist = this.clearInterval(key);
            if(exist){
                this.createInterval(key);
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    deleteWatch: function (key) {
         try {
            this.clearInterval(key);
            
            fs.unlinkSync(this.cpath(key));
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    readWatchFile: function (key) {
        var body = this.readRawWatchFile(key);
        return JSON.parse(body);
    },
    readRawWatchFile: function (key) {
        var body = fs.readFileSync(this.cpath(key), 'utf8');
        return body;
    },
    cpath: function (key) {
        return path + key + ".json";
    },
    isJson: function (body) {
        try {
            JSON.parse(body);
            return true;
        } catch (e) {
            return false;
        }
    }
    
};