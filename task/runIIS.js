var log = require('./log');
var path = require('path');
var execPort = require('child_process').exec;

execPort(path.dirname(__dirname) + '/runIIS.wsf', function(error, stdout, stderr) {
    if (error) {
        console.log(error);
    }
    log.writePort();
});