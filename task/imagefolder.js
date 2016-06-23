var images = require("images");
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var sourcePath = 'D:\\Data\\My documents\\Desktop\\Output\\';
var imgFolder = glob.sync('{images/,mobile/images/}', {matchBase:true});

function goFolder(files, callback){
	imgFolder.forEach(function(item, index, arr){
		var mobileImg = files.filter(function(file){
			return file.indexOf('mobile') > -1;
		});
		var pcImg = files.filter(function(file){
			return file.indexOf('mobile') === -1;
		});
		var goPath = item;
		var img = /mobile/.test(goPath) ? mobileImg : pcImg;
		var i = 0;
		function sort(img, goPath){
			if(img.length > i){
				var imgItem = img[i]
				var outputItem = !/mobile/.test(goPath) ? /sprite/.test(imgItem) ? 'sprite/'+ imgItem : imgItem : /sprite/.test(imgItem) ?'sprite/'+ imgItem.split('mobile-')[1] : imgItem.split('mobile-')[1];
				var is = fs.createReadStream(sourcePath + imgItem);
				var os = fs.createWriteStream(goPath + outputItem);
				is.pipe(os)
				os.on('finish', function() {
					if (img.length == i){
						callback >> callback(sourcePath)
					}
					sort(img, goPath)
					console.log(imgItem +" is going to current folder");
				});
				i++
			}else if(img.length == 0){
				return
			}
		};
		sort(img, goPath)
	})
};

fs.readdir(sourcePath, (err, files) => {
	if (/_tmp/.test(files.toString())){
		return this
	}else{
		var jpg = files.filter(function(file){
			return file.indexOf('_jpg') > -1;
		});
		var img = files.filter(function(file){
			return file.indexOf('_jpg') === -1;
		});
		var unlink = img;

		var i = 0;
		function convJpg(jpg, i){
			if(jpg.length > i){
				var item = jpg[i];
				var convFile = item.replace('_jpg', '').slice(0, -4) +'.jpg';
				images(sourcePath + item)
					.save(sourcePath + convFile, {
						quality : 100
					});
				img.push(convFile);
				fs.unlink(sourcePath + item, function(){
					convJpg(jpg, i)
					console.log(convFile + ' convert');
				})
				i++
			}else{
				goFolder(img, function(sourcePath){
					unlink.forEach(function(item){
						fs.unlinkSync(sourcePath + item)
					})
				});
			}
		};
		convJpg(jpg, i)
	}
});