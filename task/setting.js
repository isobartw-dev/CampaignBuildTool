var fs = require('fs');
var path = require('path');
var os = require('os');
var Registry = require('winreg');

var regKey = new Registry({ // new operator is optional 
    hive: Registry.HKCU, // open registry hive HKEY_CURRENT_USER 
    key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders\\' // key containing autostart programs 
})
var homeDirPath = path.win32.normalize(os.homedir() + '/Desktop');
var hasHomeDirOutput = fs.readdirSync(homeDirPath).indexOf('Output') > -1 ? true : false;

exports = module.exports = {};
function writeOutputPath(files, outputDir){
    files.forEach(function (file, index, arr) {
        var read = fs.readFileSync(file).toString(),
            result;
        if (file.indexOf('json') > -1) {
            result = read.replace('desktop', outputDir.replace(/\\/g, '/') + '/Output/**/*');
        } else {
            result = read.replace('desktop', outputDir.replace(/\\/g, '\\\\') + '\\\\Output\\\\');
        }
        fs.writeFileSync(file, result, 'utf8');
    });
}

exports.setImgDir = function() {
    var files = [path.dirname(__dirname) + '/package.json', path.dirname(__dirname) + '/task/imagefolder.js'];

    if(hasHomeDirOutput){
        writeOutputPath(files, homeDirPath);
    }else{
        regKey.values(function (err, items) {
            if (err) {
                console.log('ERROR: ' + err);
            } else {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].name == 'Desktop') {
                        var outputDir = items[i].value;
                        writeOutputPath(files, outputDir);
                    }
                }
            }
        });
    }
    
    console.log('Output資料夾位置設定完成')
}