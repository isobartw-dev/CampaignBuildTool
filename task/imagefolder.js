var sharp = require("sharp");
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var imagesmin = require('./imagemin');
var minTime = require('./log').get('image');
var sourcePath = getChangeFile('task/.changelog');
var imgFolder = glob.sync('**/images/', { matchBase: true, ignore: 'node_modules/**' }).reverse();
var allFiles;

function getChangeFile(changelog) {
    var data = fs.readFileSync(changelog, 'utf-8');
    if (!data) return;

    if (process.platform == 'win32') {
        return path.win32.dirname(data) + '/';
    } else {
        return path.dirname(data) + '/';
    }
}

function goFolder(files, callback) {
    files.forEach(function(file, index, array) {
        for (var i = 0; i < imgFolder.length; i++) {
            var filter = imgFolder[i].replace('images/', '').replace('/', '-');

            if (file.indexOf(filter) > -1) {
                var subFolder = !file.match(/\-\w{1,}\_/g) ? '' : file.match(/\-\w{1,}\_/g)[0].slice(1, -1) + '/';

                sort(file, imgFolder[i] + subFolder, filter);
                return
            }
        }
    })

    function sort(imgFile, goPath, filter) {
        var outputItem = imgFile.replace(filter, '');

        var is = fs.createReadStream(sourcePath + imgFile);
        var os = fs.createWriteStream(goPath + outputItem);

        // console.log(goPath + outputItem, sourcePath + img)

        is.pipe(os);
        os.on('finish', function() {
            console.log('> ' + outputItem + ' 已到正確的資料夾');
            callback >> callback(sourcePath, outputItem, goPath);
        });
    };
};

function convert(convFiles, i) {
    // console.log(files, i);
    if (convFiles.length > i) {
        var file = convFiles[i];
        var ext = file.indexOf('@') > -1 ? file.slice(-10, -7) : file.slice(-7, -4);
        var convFile = file.replace('_' + ext, '').slice(0, -4) + '.' + ext;

        sharp(sourcePath + file).jpeg({
            quality: 100
        }).toFile(sourcePath + convFile, function(error, info) {
            allFiles.push(convFile);
            console.log('> ' + file + ' 已轉檔為' + ext);
            fs.stat(sourcePath + file, function(error, stats) {
                if (error == null) {
                    fs.unlinkSync(sourcePath + file);
                };
                convert(convFiles, i);
            });
        });
        i++;
    } else {
        goFolder(allFiles, function(sourcePath, file, goPath) {
            fs.stat(sourcePath + file, function(error, stats) {
                if (error == null) {
                    fs.unlinkSync(sourcePath + file);
                } else {
                    console.log('電腦秀逗惹~等等他');
                };
            });
        });
    };
};

function imagefolder(sourcePath) {

    fs.readdir(sourcePath, (error, files) => {
        if (/_tmp/.test(files.toString())) {
            return this;
        } else if (!sourcePath.match(/output/ig)) {
            imagesmin([sourcePath], false);
        } else {
            var convFiles = files.filter(function(file) {
                return file.indexOf('_jpg') > -1;
            });
            allFiles = files.filter(function(file) {
                return file.indexOf('_jpg') === -1;
            });
            var i = 0;
            
            convert(convFiles, i);
        };
    });

}

process.on('exit', (code) => {
    if (code != 0) {
        console.log('有地方出錯!!重來一遍');
    } else {
        fs.writeFileSync('task/.changelog', '');
    };
})

if (sourcePath) {
    fs.stat(sourcePath, function(error, data) {
        if (!error && Date.parse(minTime) < fs.statSync(sourcePath).atime) {
            imagefolder(sourcePath)
        }
    })
}