var path = require('path');
var fs = require('fs');
var execPort = require('child_process').exec;
var browsersync = require('browser-sync');
var ngrok = require('ngrok');
var log = require('./log');
var port = log.get('port');

fs.stat(path.dirname(__dirname) + '\\runIIS.wsf', function (error) {
  if (error) {
    devUrl();
  } else {
    execPort('tasklist /fi "imagename eq iisexpress.exe"', function (error, stdout, stderr) {
      if (error) {
        console.log(error);
      }
      if (stdout) {
        // console.log(stdout)
        if (stdout.indexOf('iis') === -1) {
          console.log('沒有啟動IIS，我來幫你啟動IIS');
          execPort('npm run runIIS', function (error, stdout, stderr) {
            if (error) {
              console.log(error);
            }
          }).on('exit', function (code, signal) {
            if (code === 0) {
              devUrl(port);
            }
          });
        } else {
          console.log('IIS 運行中，確認目前運行的是否為本專案，如果不是，請先停止目前運行的IIS');
          devUrl(port);
        }
      }
    });
  }
});

function devUrl (getport) {
  (async function() {
    await ngrok.kill();
    const url = await ngrok.connect({
      proto: 'http',
      addr: 'localhost:' + port,
      host_header: 'localhost',
      bind_tls: false
    });
    const UIUrl = ngrok.getUrl();

    console.log('測試用公用網址');
    console.log('[ngrok] ' + url);
    console.log('[ngrok mobile] ' + url + '/mobile/index.aspx');
    console.log('[ngrok UI] ' + UIUrl);
    console.log(' --------------------------------------');
    console.log('開發抓蟲用同網段網址');
  })().then(() => {
    browsersync({
      proxy: getport ? 'localhost:' + getport : false,
      server: !getport,
      port: 3000,
      files: '**',
      watchOptions: {
        ignoreInitial: true,
        ignored: ['task', 'node_modules', 'source-map', 'package.json', '**/images', '**/sass', '**/sprite', '**/style-source.css', '**/style-edit.css']
      },
      socket: {
        // mobile & 遠端測試用
        // domain: devip()[0] +':3000'
      },
      open: true
    });
  });
}

process.on('exit', code => {
  if (code !== 0) {
    console.log('有地方出錯! task已停止');
  }
});
