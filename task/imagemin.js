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

function optimizeCallbak(input, output, sort) {
    return function(error, stat) {
        if (error) {
            reject(error);
        } else {
            var outputSize = fs.statSync(output)['size'];

            if (input == 0) return;
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
                imageSize.mobile.min.push(outputSize);
            } else {
                imageSize.pc.min.push(outputSize);
            }

            console.log(sprintf("%'.-6s | %'.-" + stringSize + "s %-10s %s %-10s %2s %-10s", sort, path.basename(output), sizeUnit(source), ' - ', sizeUnit(source - outputSize), ' => ', sizeUnit(outputSize)));
        }
    }
};

function optimize(input, files, options = { pc, mobile, sort }) {
    var minImages = [];

    for (var i = 0; i < files.length; i++) {
        var file = files[i];

        if (options) {
            var pc = options.pc;
            var mobile = options.mobile;
            stringSize = file.length > stringSize ? file.length : stringSize;

            if (input.indexOf('mobile') > -1) {
                mobile.push(fs.statSync(file)['size']);
            } else {
                pc.push(fs.statSync(file)['size']);
            }
        } else {
            minImages.push(fs.statSync(file)['size']);
        }
    };

    imagemin(files, input, {
        plugins: [
            pngquant({
                quality: '80-100'
            }),
            jpegrecompress({
                quality: 'veryhigh',
                method: 'smallfry',
                min: 80,
                loops: 3
            }),
            gifsicle({
                interlaced: true,
                optimizationLevel: 3
            }),
            svgo({
                removeViewBox: false
            })
        ]
    }).then(files => {
        log.writeTime();

        for (var i = 0; i < files.length; i++) {
            var outputFile = files[i].path;

            if (options) {
                var sourceSize = input.indexOf('mobile') > -1 ? mobile[i] : pc[i];

                fs.stat(outputFile, optimizeCallbak(sourceSize, outputFile, options.sort));
            } else {
                var minImagesMinSize = sizeUnit(fs.statSync(outputFile)['size']);
                var minImagesSaveSize = sizeUnit(minImages[i] - fs.statSync(outputFile)['size']);

                console.log(outputFile + ' ' + sizeUnit(minImages[i]) + ' 壓縮了 ' + minImagesSaveSize +
                    ' => ' + minImagesMinSize);
            }
        }
    });
}

function imagesmin(imgFolder, self) {
    var minTime = log.get('image');
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
            min: []
        },
        mobile: {
            origin: [],
            min: []
        }
    };

    imgFolder.forEach(function(item, index, arr) {
        var input = item;
        var sort = input.replace(/(\/images|images)\//g, '').indexOf('mobile') > -1 ? input.replace(/(\/images|images)\//g, '') : 'pc';
        var options = self != true ? self : {
            pc: imageSize.pc.origin,
            mobile: imageSize.mobile.origin,
            sort: sort
        }

        fs.readdir(input, function(error, files) {
            if (error) {
                reject(error);
            } else {
                if (minTime) {
                    files = files.filter(function(file) {
                        var time = String(fs.statSync(input + file).mtime).slice(4, 24);
                        // console.log(file, Date.parse(time), Date.parse(minTime), Date.parse(time) > Date.parse(minTime));
                        return Date.parse(time) > Date.parse(minTime) && /(png|jpg|gif|svg)/g.test(file);
                    }).map(function(file) {
                        return input + file
                    });

                    if (files.length == 0) {
                        if (self) {
                            console.log(sort + " 沒有需要壓縮的圖片");
                        }
                        return;
                    } else {
                        // console.log(input, files, options)
                        optimize(input, files, options);
                    }
                } else {
                    files = files.map(function(file) {
                        return input + file
                    });
                    // console.log(input, files, options)
                    optimize(input, files, options);
                }
            }
        });
    });

    process.on('exit', (code) => {
        var pc = imageSize.pc;
        var mobile = imageSize.mobile;
        var png = imageType.png;
        var jpg = imageType.jpg;
        var gif = imageType.gif;
        var svg = imageType.svg;

        if (code == 0 && mobile.origin.length != 0 || code == 0 && pc.origin.length != 0) {
            var mobileOriginSize = mobile.origin.length == 0 ? 0 : mobile.origin.reduce(getSum);
            var pcOriginSize = pc.origin.length == 0 ? 0 : pc.origin.reduce(getSum);
            var mobileMinSize = mobile.min.length == 0 ? 0 : mobile.min.reduce(getSum);
            var pcMinSize = pc.min.length == 0 ? 0 : pc.min.reduce(getSum);
            var mobileSaveSize = mobileOriginSize - mobileMinSize;
            var pcSaveSize = pcOriginSize - pcMinSize;

            console.log(sprintf("%'=80s\n%5s\t%5s\t%5s\t%5s", '', png.length + ' png', jpg.length + ' jpg', gif.length + ' gif', svg.length + ' svg'));
            console.log(sprintf("%-13s\t%3s%10s\t%3s%10s", 'mobile images', '壓縮了', sizeUnit(mobileSaveSize), '=>', sizeUnit(mobileMinSize)));
            console.log(sprintf("%-13s\t%3s%10s\t%3s%10s", 'pc images', '壓縮了', sizeUnit(pcSaveSize), '=>', sizeUnit(pcMinSize)));
        } else if (code == 0 && mobile.origin.length == 0 || code == 0 && pc.origin.length == 0) {
            return false;
        } else {
            console.log('有地方出錯! task已停止');
        }
    });
}

if (require.main === module) {
    imagesmin(imgFolder, true);
} else {
    module.exports = imagesmin;
}