var browsersync = require("browser-sync");
var fs = require('fs');
var getport = fs.readFileSync('task/port.txt', 'utf-8');

browsersync({
	port: getport,
	proxy: 'localhost:'+ getport,
	files: ['css/*.css', 'mobile/css/*.css', '*.aspx', '*.html', '*.js'],
	watchOptions: {
	    ignoreInitial: true,
	    ignored: 'style_edit.css'
	}
});
