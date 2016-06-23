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
		fs.writeFile('task/port.txt', d, (err) => {
			console.log('成功獲取local port')
		})
		linereader.close();
	}else{
		return
	}
});