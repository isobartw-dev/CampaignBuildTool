var path = require('path');
var fs = require('fs');
var execPort = require('child_process').exec;
var browsersync = require("browser-sync");
var ngrok = require('ngrok');
var devip = require('dev-ip');
var log = require('./log');
var port = log.get('port');
var project = log.get('project');

fs.stat(path.dirname(__dirname) + '\\runIIS.wsf', function(error) {
    if (error) {
        devUrl();
    } else {
        execPort('tasklist /fi "imagename eq iisexpress.exe"', function(error, stdout, stderr) {
            if (stdout) {
				// console.log(stdout)
                if (stdout.indexOf('iis') == -1) {
                    console.log('沒有啟動IIS，我來幫你啟動IIS');    
                    execPort('npm run runIIS', function(error, stdout, stderr) {
                        if (error) {
                            console.log(error);
                        }
                    }).on('exit', function(code, signal) {
                        if (code == 0) {
                            devUrl(port);
                        }
                    })
                } else {
                    console.log(project + ' 快樂運行中');
                    devUrl(port);
                }
            }
        })
    }
});


function devUrl(getport) {
    ngrok.connect({
        proto: 'http',
        addr: 'localhost:' + getport,
        host_header: 'localhost',
        bind_tls: false
    }, function(err, url) {
        console.log('測試用公用網址');
        console.log('[ngrok] ' + url);
        console.log('[ngrok mobile] ' + url + '/mobile/index.aspx');
        console.log('[ngrok UI] http://127.0.0.1:4040/');
        console.log(" --------------------------------------");
        console.log('開發抓蟲用同網段網址');
    });
    browsersync({
        proxy: getport ? 'localhost:' + getport : false,
        server: getport ? false : true,
        port: 3000,
        files: '**',
        watchOptions: {
            ignoreInitial: true,
            ignored: [
                'task',
                'node_modules',
                'source-map',
                'package.json',
                '**/images',
                '**/sass',
                '**/sprite',
                '**/style-source.css'
            ],
        },
        socket: {
            // mobile & 遠端測試用
            // domain: devip()[0] +':3000'
        },
        open: true
    })
};

process.on('exit', (code) => {
    if (code != 0) {
        console.log('有地方出錯! task已停止');
    }
});