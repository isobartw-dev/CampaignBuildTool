var browsersync = require("browser-sync");
var ngrok = require('ngrok');
var fs = require('fs');
var getport = fs.readFileSync('task/port.txt', 'utf-8');

browsersync({
	proxy:'localhost:'+ getport,
	files: '**',
	watchOptions: {
	    ignoreInitial: true,
	    ignored: 'style-edit.css'
	},
	socket: {
	    domain: '10.65.136.133:3000'
	},
	open:false
}, function(err, bs){
	ngrok.connect({addr:bs.options.get('port'), bind_tls:false}, function (err, url) {
		console.log(url)
		console.log("http://127.0.0.1:4040/");
	});
});