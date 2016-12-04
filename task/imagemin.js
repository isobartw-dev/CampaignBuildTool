var imagemin = require('imagemin');
var pngquant = require('imagemin-pngquant');
var jpegrecompress = require('imagemin-jpeg-recompress');
var gifsicle = require('imagemin-gifsicle');
var svgo = require('imagemin-svgo');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var imgFolder = glob.sync('{images/,mobile/images/}', {matchBase:true});
var sprintf = require('tiny-sprintf');
var log = require('./log');
var png = [], jpg = [], gif = [], svg = [], pc = [], mobile = [], stringSize = 0, mobileSize = [], pcSize = [], mobileSaveSize, pcSaveSize, minFiles;

function getSum(total, num){
	return	total + num;
};
function optimizeCallbak(source, output, sort){
	var outputSize = fs.statSync(output)['size'];
	if(source == 0) return;
	return function(err, stat){
		switch(path.basename(output).split('.')[1]){
			case 'png':
				png.push(output);
				break;
			case 'jpg':
				jpg.push(output);
				break;
			case 'gif':
				gif.push(output);
				break;
			case 'svg':
				svg.push(output);
				break;
		}
		if(sort == 'mobile'){
			mobileSize.push(outputSize);
		}else{
			pcSize.push(outputSize);
		}
		console.log(sprintf("%6s | %-"+ stringSize +"s\t%8s%2s%5s\t%s%7s", sort, path.basename(output), source, ' - ', source - outputSize, ' => ', outputSize));
	}
};
var minTime = log.get('image');

imgFolder.forEach(function(item, index, arr){
	var sort = item.indexOf('mobile') > -1 ? 'mobile' : 'pc';
	var input = item;
	function optimize(item, input, files, pc, mobile, sort){
		for(var i = 0; i < files.length; i++){
			var file = input + files[i];
			stringSize = file.length > stringSize ? file.length : stringSize;
			if(input.indexOf('mobile') > -1){
				mobile.push(fs.statSync(file)['size']);
			}else{
				pc.push(fs.statSync(file)['size']);
			}
		};
		imagemin([input+'*.{jpg,png,gif,svg}'], item, {
		    plugins: [
		        pngquant({quality:'70-95', speed: 5}),
		        jpegrecompress({quality:'height', method:'smallfry', min: 60, loops: 3}),
		        gifsicle({interlaced: true, optimizationLevel: 3}),
		        svgo({removeViewBox: false})
		    ]
		}).then(files => {
		    fs.readdir(input, function(err, files){
				for(var i = 0; i < files.length; i++){
					var sourceSize = input.indexOf('mobile') > -1 ? mobile[i] : pc[i];
					var outputFile = item + files[i];
					mobileSaveSize = mobile.length == 0 ? 0 : mobile.reduce(getSum); 
					pcSaveSize = pc.length == 0 ? 0 : pc.reduce(getSum);
					if(input.indexOf('min') > -1){
						fs.unlinkSync(input+files[i]);
					}
					fs.stat(outputFile, optimizeCallbak(sourceSize, outputFile, sort));
				}
				if(input.indexOf('min') > -1){
					fs.rmdir(input);
				}
			});
		});
	}
	fs.readdir(item, function(err, files){
		if(minTime){
			fs.mkdtemp(item+'min', function(err, folder){
				input = folder +'/';
				// console.log(input);
				files = files.filter(function(file){
					var time = String(fs.statSync(item+file).mtime).slice(0, 21);
					// console.log(file, time, minTime, time > minTime);
					return time > minTime && /(png|jpg|gif|svg)/g.test(file);
				});
				files.forEach(function(file, index, arr){
					fs.renameSync(item+file, input+file);
				})
				if(files.length == 0){
					console.log(sort +" 沒有需要壓縮的圖片");
					pcSaveSize = 0;
					mobileSaveSize = 0;
					fs.rmdir(input);
					return;
				}else{
					optimize(item, input, files, pc, mobile, sort);
				}
			});
		}else{
			optimize(item, input, files, pc, mobile, sort);
		}
	});
});
log.writeTime();
process.on('exit', (code) => {
	if(code == 0 && mobileSaveSize != 0 || code == 0 && pcSaveSize != 0){
		mobileSize = mobileSize.length == 0 ? 0 : mobileSize.reduce(getSum);
		pcSize = pcSize.length == 0 ? 0 : pcSize.reduce(getSum);
		mobileSaveSize = mobileSaveSize - mobileSize;
		pcSaveSize = pcSaveSize - pcSize;
		console.log(sprintf("%'=80s\n%5s\t%5s\t%5s\t%5s", '', png.length +' png', jpg.length +' jpg', gif.length +' gif', svg.length +' svg'));
		console.log(sprintf("%-13s\t%3s%10s\t%3s%10s", 'mobile images', '壓縮了', mobileSaveSize, '=>', mobileSize));
		console.log(sprintf("%-13s\t%3s%10s\t%3s%10s", 'pc images', '壓縮了', pcSaveSize, '=>', pcSize));
	}else if(code == 0 && mobileSaveSize == 0 || code == 0 && pcSaveSize == 0){
		return false;
	}else{
		console.log('有地方出錯! task已停止');
	}
});
