var sharp = require("sharp");
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var imagesmin = require('./imagemin');
var sourcePath = getChangeFile('task/.changelog');
// var sourcePath = 'E:\\Snow.Huang\\My documents\\Desktop\\Output\\';
var imgFolder = glob.sync('**/images/', { matchBase: true, ignore: 'node_modules/**' }).reverse();

function getChangeFile(file) {
    if (process.platform == 'win32') {
        return path.win32.dirname(fs.readFileSync(file, 'utf-8'))
            .replace(/\"/g, '')
            .split('\\')
            .join('/') + '/';
    } else {
        return path.dirname(fs.readFileSync(file, 'utf-8'))
            .replace(/\"/g, '')
            .split('\\')
            .join('/') + '/';
    }
}

function goFolder(files, callback){
	files.forEach(function(imgName, index, array) {
		for (var i = 0; i < imgFolder.length;i++){
			var filter = imgFolder[i].replace('images/', '').replace('/', '-');

			if (imgName.indexOf(filter) > -1) {
				var subFolder = !imgName.match(/\-\w{1,}\_/g) ? '' : imgName.match(/\-\w{1,}\_/g)[0].slice(1, -1) + '/';

				sort(imgName, imgFolder[i] + subFolder, filter);
				return
			}
		}
	})

	function sort(img, goPath, filter) {
		var outputItem = img.replace(filter, '');

		var is = fs.createReadStream(sourcePath + img);
		var os = fs.createWriteStream(goPath + outputItem);

		// console.log(goPath + outputItem, sourcePath + img)

		is.pipe(os);
		os.on('finish', function () {
			console.log(outputItem + " 已到正確的資料夾");
			callback >> callback(sourcePath);
		});
	};
};

fs.readdir(sourcePath, (err, files) => {
    if (/_tmp/.test(files.toString())) {
        return this;
    } else if (!sourcePath.match(/output/g)) {
		console.log(process.pid)
		// imagesmin([sourcePath], false);
    } else {
        var convFile = files.filter(function(file) {
            return file.indexOf('_jpg') > -1;
        });
        var img = files.filter(function(file) {
            return file.indexOf('_jpg') === -1;
        });
        var i = 0;

        function convert(file, i) {
            // console.log(files, i);
            if (file.length > i) {
                var item = file[i];
                var ext = item.indexOf('@') > -1 ? item.slice(-10, -7) : item.slice(-7, -4);
                var convFile = item.replace('_' + ext, '').slice(0, -4) + '.' + ext;

                sharp(sourcePath + item).jpeg({
                    quality: 100
                }).toFile(sourcePath + convFile, function(err, info) {
                    img.push(convFile);
                    console.log(item + ' 已轉檔為' + ext);
                    fs.stat(sourcePath + item, function(err, stats) {
                        if (err == null) {
                            fs.unlinkSync(sourcePath + item);
                        };
                        convert(file, i);
                    });
                });
                i++;
            } else {
                goFolder(img, function(sourcePath) {
                    img.forEach(function(item) {
                        fs.stat(sourcePath + item, function(err, stats) {
                            if (err == null) {
                                fs.unlinkSync(sourcePath + item);
                            } else {
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
    if (code != 0) {
        console.log('有地方出錯!!重來一遍');
    };
});