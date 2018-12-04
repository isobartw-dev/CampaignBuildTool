var fs = require('fs');
var path = require('path');
var glob = require('glob');
var imagemin = require('imagemin');
var pngquant = require('imagemin-pngquant');
var jpegrecompress = require('imagemin-jpeg-recompress');
var gifsicle = require('imagemin-gifsicle');
var svgo = require('imagemin-svgo');
var sprintf = require('tiny-sprintf');
var log = require('./log');
var imgFolder = glob.sync('**/images/', { matchBase: true, ignore: ['node_modules/**', '**/images/sprite/'] });
var stringSize = 0;
var imageType = {
    png: [],
    jpg: [],
    gif: [],
    svg: []
};
var imageSize = {
    pc: {
        origin: [],
        save: '',
        min: []
    },
    mobile: {
        origin: [],
        save: '',
        min: []
    }
};
var total;

module.exports = imagesmin;

function getSum(total, num) {
    return total + num;
};

function sizeUnit(size) {
    if (size.toString().length >= 4 && size >= 1024) {
        size = (size / 1024).toString().split('.')[0].length >= 4 ? Math.floor((size / 1024 / 1024) * 100) / 100 + ' MB' : Math.floor((size / 1024) * 100) / 100 + ' KB';
    } else {
        size = size == 0 ? 0 : size + ' byte';
    }
    return size;
};

function optimizeCallbak(source, output, sort) {
    return function(err, stat) {
        if (err) {
            reject(err);
        } else {
            var outputSize = fs.statSync(output)['size'];

            if (source == 0) return;
            switch (path.basename(output).split('.')[1]) {
                case 'png':
                    imageType.png.push(output);
                    break;
                case 'jpg':
                    imageType.jpg.push(output);
                    break;
                case 'gif':
                    imageType.gif.push(output);
                    break;
                case 'svg':
                    imageType.svg.push(output);
                    break;
            }
            if (sort == 'mobile') {
                imageSave.mobile.min.push(outputSize);
            } else {
                imageSave.pc.min.push(outputSize);
            }

            console.log(sprintf("%'.-6s | %'.-" + stringSize + "s %-10s %s %-10s %2s %-10s", sort, path.basename(output), sizeUnit(source), ' - ', sizeUnit(source - outputSize), ' => ', sizeUnit(outputSize)));
        }
    }
};

function optimize(item, input, files, options = [pc, mobile, sort]) {
    var minImages;

    for (var i = 0; i < files.length; i++) {
        var file = input + files[i];
        stringSize = file.length > stringSize ? file.length : stringSize;

        if (options) {
            if (input.indexOf('mobile') > -1) {
                mobile.push(fs.statSync(file)['size']);
            } else {
                pc.push(fs.statSync(file)['size']);
            }
        } else {
            minImages.push(fs.statSync(file)['size']);
        }
    };

    imagemin([input + '*.{jpg,png,gif,svg}'], item, {
        plugins: [
            pngquant({ quality: '80-100' }),
            jpegrecompress({ quality: 'veryhigh', method: 'smallfry', min: 80, loops: 3 }),
            gifsicle({ interlaced: true, optimizationLevel: 3 }),
            svgo({ removeViewBox: false })
        ]
    }).then(files => {
        fs.readdir(input, function(err, files) {
            if (err) {
                reject(err);
            } else {
                for (var i = 0; i < files.length; i++) {
                    if (options) {
                        var sourceSize = input.indexOf('mobile') > -1 ? mobile[i] : pc[i];
                        var outputFile = item + files[i];
                        imageSize.mobile.save = mobile.length == 0 ? 0 : mobile.reduce(getSum);
                        imageSize.pc.save = pc.length == 0 ? 0 : pc.reduce(getSum);

                        fs.stat(outputFile, optimizeCallbak(sourceSize, outputFile, sort));
                    } else {
                        console.log(outputFile + ' 壓縮完成');
                    }
                    // if (input.indexOf('min') > -1) {
                    //     fs.unlinkSync(input + files[i]);
                    // }
                }

                if (input.indexOf('min') > -1) {
                    fs.rmdirSync(input);
                }
            }
        });
    });
}

var minTime = log.get('image');

function imagesmin(imgFolder, self) {
    total = self;

    imgFolder.forEach(function(item, index, arr) {
        var sort = item.indexOf('mobile') > -1 ? 'mobile' : 'pc';
        var input = item;
        var options = self != true ? self : [
            imageSize.pc.origin,
            imageSize.mobile.origin,
            sort
		]
		
		

        fs.readdir(item, function(err, files) {
            if (err) {
                reject(err);
            } else {
                if (minTime) {
                    fs.mkdtemp(item + 'min', function(err, folder) {
                        if (err) {
                            reject(err)
                        } else {
                            input = folder + '/';
                            // console.log(input);
                            files = files.filter(function(file) {
                                var time = String(fs.statSync(item + file).mtime).slice(4, 21);
                                // console.log(file, time, minTime, time > minTime);
                                return Date.parse(time) > Date.parse(minTime) && /(png|jpg|gif|svg)/g.test(file);
                            });
                            files.forEach(function(file, index, arr) {
                                fs.renameSync(item + file, input + file);
                            })
                            if (files.length == 0 && self) {
                                console.log(sort + " 沒有需要壓縮的圖片");
                                imageSize.pc.save = 0;
                                imageSize.mobile.save = 0;
                                fs.rmdirSync(input);
                                return;
                            } else {
                                optimize(item, input, files, options);
                            }
                        }
                    });
                } else {
                    optimize(item, input, files, options);
                }
            }
        });
    });

	log.writeTime();
	
	process.on('exit', (code) => {
	    var pc = imageSize.pc;
	    var mobile = imageSize.mobile;
	    if (code == 0 && total == true && mobile.save != 0 || code == 0 && pc.save != 0) {
	        var mobileMinSize = mobile.min.length == 0 ? 0 : mobile.min.reduce(getSum);
	        var pcMinSize = pc.min.length == 0 ? 0 : pc.min.reduce(getSum);
	        var mobileSaveSize = mobile.save - mobile.min;
	        var pcSaveSize = pc.save - pc.min;

	        console.log(sprintf("%'=80s\n%5s\t%5s\t%5s\t%5s", '', png.length + ' png', jpg.length + ' jpg', gif.length + ' gif', svg.length + ' svg'));
	        console.log(sprintf("%-13s\t%3s%10s\t%3s%10s", 'mobile images', '壓縮了', sizeUnit(mobileSaveSize), '=>', sizeUnit(mobileMinSize)));
	        console.log(sprintf("%-13s\t%3s%10s\t%3s%10s", 'pc images', '壓縮了', sizeUnit(pcSaveSize), '=>', sizeUnit(pcMinSize)));
	    } else if (code == 0 && mobile.save == 0 || code == 0 && pc.save == 0 || total == false) {
	        return false;
	    } else {
	        console.log('有地方出錯! task已停止');
	    }
	});
}

imagesmin(imgFolder, true);