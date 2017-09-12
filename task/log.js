var fs = require('fs');
var path = require('path');
var rl = require('readline');
var process = require('process');
var Registry = require('winreg'),
	regKey = new Registry({                                       
      hive: Registry.HKCU,                                        
      key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders'
    });
exports = module.exports = {};
exports.writeTime = function(){
	fs.stat('task/log.txt', function(err, stat) {
		var endTime = String(new Date().toString()).slice(4, 21);
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
exports.setImgDir = function(){
	var outPutDir,
		file = [path.dirname(__dirname) + '/package.json', path.dirname(__dirname) + '/task/imagefolder.js'];
	regKey.values(function (err, items) {
		if (err){
			console.log('ERROR: ' + err);
	  	}else{
	    	for (var i = 0; i < items.length; i++){
				if(items[i].name == 'Desktop'){
					outputDir = items[i].value.indexOf('%USERPROFILE%') > -1 ? process.env.USERPROFILE +'\\desktop' : items[i].value;;
					file.forEach(function(item, index, arr){
						var read = fs.readFileSync(item).toString(),
							result;
						if(item.indexOf('json') > -1){
							 result = read.replace('desktop', outputDir.replace(/\\/g, '/') +'/Output/**/*');
						}else{
							result = read.replace('desktop', outputDir.replace(/\\/g, '\\\\')+'\\\\Output\\\\');
						}
						fs.writeFileSync(item, result, 'utf8');
					});
				}
			}
	  	}
	});
	console.log('Output資料夾位置設定完成')
}