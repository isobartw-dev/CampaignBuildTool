var ngrok = require('ngrok');
var fs = require('fs');
var getport = fs.readFileSync('task/port.txt', 'utf-8');

ngrok.connect({
	proto: 'http',
	addr: getport,
	host_header: 'localhost:'+ getport,
}, function (err, url) {
	console.log(url)
});