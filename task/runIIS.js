var path = require('path');
var execPort = require('child_process').exec;
var log = require('./log');

execPort(path.dirname(__dirname) + '/runIIS.wsf', function(error, stdout, stderr) {
    if (error) {
        // console.log(error);
        console.log('IIS 啟動失敗')
    } else {
        console.log('成功啟動 IIS')
        log.writeIISData();
    }
});