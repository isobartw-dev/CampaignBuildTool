var browsersync = require("browser-sync");
var ngrok = require('ngrok');
var fs = require('fs');
var execPort = require('child_process').execFile;

function devUrl(getport){
	ngrok.connect({
		proto: 'http',
		addr: getport,
		host_header: 'localhost:'+ getport,
		bind_tls: false
	}, function (err, url) {
		console.log('測試用公用網址');
		console.log('[ngrok] '+ url);
		console.log('[ngrok UI] http://127.0.0.1:4040/');
		console.log(" --------------------------------------");
		console.log('開發抓蟲用同網段網址');
	});
	browsersync({
		proxy:'localhost:'+ getport,
		files: '**',
		watchOptions: {
		    ignoreInitial: true,
		    ignored: 'style-edit.css'
		},
		socket: {
		    domain: '192.168.123.1:3000'
		},
		open:false
	});
};

execPort('node', ['task/get-port.js'], function(error, stdout, stderr) { 
 	if(error){
 		console.log(error);
 	}
 	console.log(stdout)
 	var getport = fs.readFileSync('task/port.txt', 'utf-8');
 	devUrl(getport)
});