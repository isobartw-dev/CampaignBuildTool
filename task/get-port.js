var fs = require('fs');
var path = require('path');
var rl = require('readline');
var dir = path.dirname(__dirname);
var file = dir + '\\' + dir.split(path.sep).pop() +'.sln';
var linereader = rl.createInterface({
	input: fs.createReadStream(file),
	output: process.stdout
});

linereader.on('line', function (line) {
	if(/VWDPort/.test(line)){
		var d = line.split('"')[1];
		fs.writeFile('port.txt', d, (err) => {
			console.log('get port')
		})
		linereader.close();
	}else{
		return
	}
});