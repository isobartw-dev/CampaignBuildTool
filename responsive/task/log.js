var fs = require('fs');
var path = require('path');
var rl = require('readline');
exports = module.exports = {};
exports.writeTime = function(){
	fs.stat('task/log.txt', function(err, stat) {
		var endTime = String(new Date().toString()).slice(0, 21);
		if(err == null){
			var readLog = fs.readFileSync('task/log.txt').toString();
			if(readLog){
				var readLine = readLog.split('\r');
				if(readLine.toString().indexOf('[image]') > -1){
					readLine.filter(function(line, index, arr){
						if(line.indexOf('[image]') > -1){
							return arr.splice(index, 1, '[image]\t'+ endTime);
						}else{
							return arr
						}
					});
				}else{
					readLine.push('[image]\t'+ endTime);
				}
				fs.truncate('task/log.txt', 0, function(){
					readLine.forEach(function(line, index, arr){
						if(index+1 == arr.length){
							fs.appendFileSync('task/log.txt', line);
						}else{
							fs.appendFileSync('task/log.txt', line +'\r');
						}
					});
				});
			}else{
				var createLog = fs.createWriteStream('task/log.txt');
				createLog.write('[image]\t'+ endTime);
			};
		}else if(err.code == 'ENOENT'){
			var createLog = fs.createWriteStream('task/log.txt');
			createLog.write('[image]\t'+ endTime);
		} 
		console.log("時間戳記已寫入");
	});
};
exports.writePort = function(){
	var glob = require('glob');
	var dir = path.dirname(__dirname);
	var file = dir +'\\'+ glob.sync('**/?*.sln', {matchBase:true}).toString();
	var linereader = rl.createInterface({
		input: fs.createReadStream(file),
		output: process.stdout
	});
	linereader.on('line', function (line) {
		if(/VWDPort/.test(line)){
			var d = '[port]\t'+ line.split('"')[1];
			fs.stat('task/log.txt', function(err, stat) {
				if(err == null){
					var readLog = fs.readFileSync('task/log.txt').toString();
					if(readLog){
						var readLine = readLog.split('\r');
						if(readLine.toString().indexOf('[port]') > -1){
							readLine.filter(function(line, index, arr){
								if(line.indexOf('[port]') > -1){
									return arr.splice(index, 1, d);
								}else{
									return arr
								}
							});
						}else{
							readLine.push(d);
						}
						fs.truncate('task/log.txt', 0, function(){
							readLine.forEach(function(line, index, arr){
								if(index+1 == arr.length){
									fs.appendFileSync('task/log.txt', line);
								}else{
									fs.appendFileSync('task/log.txt', line +'\r');
								}
							});
						});
					}else{
						var createLog = fs.createWriteStream('task/log.txt');
						createLog.write(d);
					};
				}else if(err.code == 'ENOENT'){
					var createLog = fs.createWriteStream('task/log.txt');
					createLog.write(d);
				} 
				console.log('成功啟動IIS並且獲取local port')
			});
			linereader.close();
		}else{
			return
		}
	});
};
exports.get = function(sort){
	var readLog = fs.readFileSync('task/log.txt').toString();
	if(readLog){
		var readLine = readLog.split('\r');
		var get = readLine.find(function(item){
			return item.indexOf(sort) > -1;
		});
		if(get){
			return get.toString().split('\t')[1];
		}
	}else{
		switch (sort){
			case 'image':
				console.log('沒有圖片壓縮日期，壓縮全部圖片');
				break;
			case 'port':
				console.log('沒有port值，請先執行runIIS指令')
				break;
		}
	}
};