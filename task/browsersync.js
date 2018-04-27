var browsersync = require("browser-sync");
var ngrok = require('ngrok');
var devip = require('dev-ip');
var fs = require('fs');
var log = require('./log');
var port = log.get('port');

function devUrl(getport){
	ngrok.connect({
		proto: 'http',
		addr: getport,
		host_header: 'localhost',
		bind_tls: false
	}, function (err, url) {
		console.log('測試用公用網址');
		console.log('[ngrok] '+ url);
		console.log('[ngrok mobile] '+ url +'/mobile/index.aspx');
		console.log('[ngrok UI] http://127.0.0.1:4040/');
		console.log(" --------------------------------------");
		console.log('開發抓蟲用同網段網址');
	});
	browsersync({
		proxy:'localhost:'+ getport,
		port: 3000,
		files: '**',
		watchOptions: {
			ignoreInitial: true,
			ignored: [
				'task',
				'node_modules',
				'**/images',
				'**/sass',
				'**/sprite',
				'**/*.css.map',
				'**/style-edit.css'
			],
		},
		socket: {
			// mobile & 遠端測試用
			// domain: devip()[0] +':3000'
		},
		open: false
	})
};

devUrl(port);
process.on('exit', (code) => {
	if(code != 0){
		console.log('有地方出錯! task已停止');
	}
});