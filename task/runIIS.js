var path = require('path');
var execPort = require('child_process').exec;
var log = require('./log');

// execPort(path.dirname(__dirname) + '/runIIS.wsf', function(error, stdout, stderr) {
//     if (error) {
//         // console.log(error);
//         console.log('IIS 啟動失敗')
//     } else {
//         console.log('成功啟動 IIS')
//         log.writeIISData();
//     }
// });

execPort('tasklist /fi "imagename eq iisexpress.exe"', function(error, stdout, stderr) {
  if (stdout) {
    // console.log(stdout)
    if (stdout.indexOf('iis') == -1) {
      console.log('沒有啟動IIS，我來幫你啟動IIS');
      execPort('npm run runIIS', function(error, stdout, stderr) {
        if (error) {
          // console.log(error);
          console.log('IIS 啟動失敗');
        } else {
          console.log('成功啟動 IIS');
          log.writeIISData();
        }
      });
    } else {
      console.log('IIS 運行中，確認目前運行的是否為本專案，如果不是，請先停止目前運行的IIS');
    }
  }
});
