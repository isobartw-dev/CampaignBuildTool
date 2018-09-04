var images = require("images");
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var sourcePath = 'E:\\Snow.Huang\\My documents\\Desktop\\Output\\';
var imgFolder = glob.sync('**/images/', { matchBase: true, ignore: 'node_modules/**' });

function goFolder(files, callback){
	var mobileImg = files.filter(function(file){
		return file.indexOf('mobile') > -1;
	});
	var pcImg = files.filter(function(file){
		return file.indexOf('mobile') === -1;
	});
	imgFolder.forEach(function(item, index, arr){
		var goPath = item;
		var img = /mobile/.test(goPath) ? mobileImg : pcImg;
		var i = 0;
		function sort(img, goPath){
			// console.log(img.length, i);
			if(img.length > i){
				var imgItem = img[i];
				var folder = !imgItem.match(/\-\w{1,}\_/g) ? '' : imgItem.match(/\-\w{1,}\_/g)[0].slice(1,-1);
				if(folder && /sprite/.test(folder)){
					var outputItem = folder+ '/'+ (/mobile/.test(imgItem) ? imgItem.split('mobile-')[1] : imgItem);
				}else if(folder){
					var outputItem = folder+ '/'+ (/mobile/.test(imgItem) ? imgItem.split('mobile-')[1].replace('-'+ folder +'_', '') : imgItem.replace('-'+ folder +'_', ''));
				}else{
					var outputItem = /mobile/.test(imgItem) ? imgItem.split('mobile-')[1] : imgItem;
				}	
				var is = fs.createReadStream(sourcePath + imgItem);
				var os = fs.createWriteStream(goPath + outputItem);
				is.pipe(os);
				os.on('finish', function() {
					++i;
					console.log(imgItem +" 已到正確的資料夾");
					if(img.length == i){
						callback >> callback(sourcePath);
					}else{
						sort(img, goPath);
					};
				});
			}else if(img.length == 0){
				return;
			};
		};
		sort(img, goPath);
	});
};

fs.readdir(sourcePath, (err, files) => {
	if (/_tmp/.test(files.toString())){
		return this;
	}else{
		var convFile = files.filter(function(file){
			return file.indexOf('_jpg') > -1;
		});
		var img = files.filter(function(file){
			return file.indexOf('_jpg') === -1;
		});

		var i = 0;
		function convert(file, i){
			// console.log(files, i);
			if(file.length > i){
				var item = file[i];
				var ext = item.indexOf('@') > -1 ?  item.slice(-10, -7) : item.slice(-7, -4);
				var convFile = item.replace('_'+ ext, '').slice(0, -4) +'.'+ ext;
				var data = images(sourcePath + item).encode(ext);
				fs.writeFile(sourcePath + convFile, data, function(){
					img.push(convFile);
					console.log(item + ' 已轉檔為'+ ext);
					fs.stat(sourcePath + item, function(err, stats){
						if(err == null){
							fs.unlinkSync(sourcePath + item);
						};
						convert(file, i);
					});
				});
				i++;
			}else{
				goFolder(img, function(sourcePath){
					img.forEach(function(item){
						fs.stat(sourcePath + item, function(err, stats){
							if(err == null){
								fs.unlinkSync(sourcePath + item);
							}else{
								console.log('電腦秀逗惹~等等他');
							};
						});
					});
				});
			};
		};
		convert(convFile, i);
	};
});
process.on('exit', (code) => {
	if(code != 0){
		console.log('有地方出錯!!重來一遍');
	};
});