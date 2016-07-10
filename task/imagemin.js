var imagemin = require('imagemin');
var pngquant = require('imagemin-pngquant');
var jpegrecompress = require('imagemin-jpeg-recompress');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var imgFolder = glob.sync('{images/,mobile/images/}', {matchBase:true});
var sprintf = require('tiny-sprintf');
var png = [], jpg = [], gif = [], svg = [], pc = [], mobile = [], stringSize = 0, mobileSize = [], pcSize = [], mobileSaveSize, pcSaveSize;

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
		console.log(sprintf("%-"+ stringSize +"s\t%8s%2s%5s\t%s%5s", path.basename(output), source, ' - ', outputSize, ' => ', source - outputSize));
	}
};
imgFolder.forEach(function(item, index, arr){
	 fs.readdir(item, function(err, files){
		for(var i = 0; i < files.length; i++){
			var file = item + files[i];
			stringSize = file.length > stringSize ? file.length : stringSize;
			if(item.indexOf('mobile') > -1){
				mobile.push(fs.statSync(file)['size']);
			}else{
				pc.push(fs.statSync(file)['size']);
			}
		};
	});

	new imagemin()
	.src(item +'*.{git,jpg,png,svg}')
	.dest(item)
	.use(pngquant({quality:'70-95', speed: 3}))
	.use(jpegrecompress({quality:'veryheight', method:'smallfry', min:60, loop:3}))
	.use(imagemin.gifsicle({interlaced: true}))
	.use(imagemin.svgo())
	.run((err, files) => {
		fs.readdir(item, function(err, files){
			for(var i = 0; i < files.length; i++){
				var sourceSize = item.indexOf('mobile') > -1 ? mobile[i] : pc[i];
				var outputFile = item + files[i];
				var sort = item.indexOf('mobile') > -1 ? 'mobile' : 'pc'; 
				mobileSaveSize = mobile.length == 0 ? 0 : mobile.reduce(getSum); 
				pcSaveSize = pc.length == 0 ? 0 : pc.reduce(getSum);
				fs.stat(outputFile, optimizeCallbak(sourceSize, outputFile, sort));
			}
		});
	});
});

process.on('exit', (code) => {
	mobileSize = mobileSize.length == 0 ? 0 : mobileSize.reduce(getSum);
	pcSize = pcSize.length == 0 ? 0 : pcSize.reduce(getSum);
	mobileSaveSize = mobileSaveSize - mobileSize;
	pcSaveSize = pcSaveSize - pcSize;
	console.log(sprintf("%'=80s\n%5s\t%5s\t%5s\t%5s", '', png.length +' png', jpg.length +' jpg', gif.length +' gif', svg.length +' svg'));
	console.log(sprintf("%-13s\t%3s%10s\t%3s%10s", 'mobile images', '壓縮了', mobileSaveSize, '=>', mobileSize));
	console.log(sprintf("%-13s\t%3s%10s\t%3s%10s", 'pc images', '壓縮了', pcSaveSize, '=>', pcSize));
});