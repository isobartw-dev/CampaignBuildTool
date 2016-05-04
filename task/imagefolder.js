var images = require("images");
var fs = require('fs');
var path = require('path');
var output = 'D:\\Data\\My documents\\Desktop\\Output\\';
var pc_path = './images/';
var mobile_path = './mobile/images/';

function sort(item, outputpath){
	var item2 = !/mobile/.test(outputpath) ? item : item.split('mobile-')[1];
	var is = fs.createReadStream(output + item);
	var os = fs.createWriteStream(outputpath + item2);
	is.pipe(os);
	is.on('end',function() {
		fs.unlink(output + item);
		if(/sprite/.test(item2 )){
			fs.renameSync(outputpath + item2 , outputpath +'sprite/' + item2);
		};
	});
};

function gofolder(files){
	var mobile_img = files.filter(function(file){
		return file.indexOf('mobile') > -1;
	});
	var pc_img = files.filter(function(file){
		return file.indexOf('mobile') === -1;
	});

	pc_img.forEach(function(item, index, array){
  		sort(item, pc_path);
	});
	mobile_img.forEach(function(item, index, array){
		sort(item, mobile_path);
	});
};

fs.readdir(output, (err, files) => {
 	if(!/_jpg/.test(files.toString())){
		gofolder(files);
	}else{
		var jpg = files.filter(function(file){
			return file.indexOf('_jpg') > -1;
		});
		var png = files.filter(function(file){
			return file.indexOf('_jpg') === -1;
		});

		jpg.forEach(function(item, index, arr){
			images(output + item)
				.save(output + item.split('_jpg')[0] +'.jpg', {               
					quality : 100                    
				});
			png.push(item.split('_jpg')[0] +'.jpg');
			fs.unlinkSync(output + item);
			console.log(item.split('_jpg')[0] +'.jpg saved');
			if(index == arr.length-1){
				gofolder(png);
			};
		});
	};
});
