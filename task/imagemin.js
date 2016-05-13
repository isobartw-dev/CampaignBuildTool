var imagemin = require('imagemin');
var pngquant = require('imagemin-pngquant');
var jpegrecompress = require('imagemin-jpeg-recompress');
var fs = require('fs');
var path = require('path');
var images = ['./images/', './mobile/images/'];
var sprintf = require('tiny-sprintf');
var png = [], jpg = [], gif = [], svg = [], pc = [], mobile = [];

images.forEach(function(item, index, arr){
	 fs.readdir(item, function(err, files){
		for(var i = 0; i < files.length; i++){
			var file = item + files[i];
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
				var file = item.indexOf('mobile') > -1 ? mobile[i] : pc[i];
				var fileopt = item + files[i];
				fs.stat(fileopt, src_callbak(file, fileopt));
			}
		});
	});
});
function src_callbak(origin, output){
	if(origin == 0) return;
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
		console.log(sprintf("%-40s\t%10s => %8s", path.basename(output), origin, fs.statSync(output)['size']));
	}
};
process.on('exit', (code) => {
  console.log(sprintf("%'=60s\n%s%5s\t %5s\t%5s\t%5s", '', '總共壓縮', png.length +' png', jpg.length +' jpg', gif.length +' gif', svg.length +' svg'));
});
