global.logic = module.exports = {
    processQuery: function (opt) {
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
                    var result = JSON.parse(responseBody);
                    var conditionResult = eval(this.externalData.condition);
                    
                    if(conditionResult){
                        this.processThen(opt);
                    }
                    
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
    processThen: function (opt) {
        
    }
}