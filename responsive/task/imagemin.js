var imagemin = require('imagemin');
var pngquant = require('imagemin-pngquant');
var jpegrecompress = require('imagemin-jpeg-recompress');
var gifsicle = require('imagemin-gifsicle');
var svgo = require('imagemin-svgo');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var imgFolder = glob.sync('{images/}', {matchBase:true});
var sprintf = require('tiny-sprintf');
var log = require('./log');
var png = [], jpg = [], gif = [], svg = [], imgs = [], stringSize = 0, Size = [], SaveSize, minFiles;

function getSum(total, num){
	return	total + num;
};
function optimizeCallbak(source, output){
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
		Size.push(outputSize);
		console.log(sprintf("%-"+ stringSize +"s\t%8s%2s%5s\t%s%7s", path.basename(output), source, ' - ', source - outputSize, ' => ', outputSize));
	}
};
var minTime = log.get('image');
log.writeTime();
imgFolder.forEach(function(item, index, arr){
	var input = item;
	function optimize(item, input, files, pc, mobile, sort){
		for(var i = 0; i < files.length; i++){
			var file = input + files[i];
			stringSize = file.length > stringSize ? file.length : stringSize;
			imgs.push(fs.statSync(file)['size']);
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
					var sourceSize = imgs[i];
					var outputFile = item + files[i];
					SaveSize = imgs.length == 0 ? 0 : imgs.reduce(getSum);
					if(input.indexOf('min') > -1){
						fs.unlinkSync(input+files[i]);
					}
					fs.stat(outputFile, optimizeCallbak(sourceSize, outputFile));
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
					console.log("沒有需要壓縮的圖片");
					SaveSize = 0;
					fs.rmdir(input);
					return;
				}else{
					optimize(item, input, files, imgs);
				}
			});
		}else{
			optimize(item, input, files, imgs);
		}
	});
});

process.on('exit', (code) => {
	if(code == 0 && SaveSize != 0){
		Size = Size.length == 0 ? 0 : Size.reduce(getSum);
		SaveSize = SaveSize - Size;
		console.log(sprintf("%'=80s\n%5s\t%5s\t%5s\t%5s", '', png.length +' png', jpg.length +' jpg', gif.length +' gif', svg.length +' svg'));
		console.log(sprintf("%5s%10s\t%3s%10s", '總共壓縮了', SaveSize, '=>', Size));
	}else if(code == 0 && SaveSize == 0){
		return false;
	}else{
		console.log('有地方出錯! task已停止');
	}
});