var fs = require('fs');
var path = require('path');
var os = require('os');
var Registry = require('winreg');
var regKey = new Registry({ // new operator is optional 
    hive: Registry.HKCU, // open registry hive HKEY_CURRENT_USER 
    key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders\\' // key containing autostart programs 
})

exports = module.exports = {};
exports.setImgDir = function() {
    var outPutDir;
    var file = [path.dirname(__dirname) + '/package.json', path.dirname(__dirname) + '/task/watch-image.js'];

    function writePath(files, outputDir) {
        files.forEach(function(item, index, arr) {
            var read = fs.readFileSync(item).toString();
            var result;

            if (item.indexOf('json') > -1) {
                result = read.replace('[desktop]', outputDir.replace(/\\/g, '/') + '/Output/**/*');
            } else {
                result = read.replace('[desktop]', outputDir.replace(/\\/g, '\\\\') + '\\\\Output\\\\');
            }
            fs.writeFileSync(item, result, 'utf8');
        });
    }

    fs.stat(os.homedir() + '\\desktop\\output', function (error, stats) {
        if(error){
            regKey.values(function(err, items) {
                if (err) {
                    console.log('ERROR: ' + err);
                } else {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].name == 'Desktop') {
                            outputDir = items[i].value;
                            writePath(files)
                        }
                    }
                }
            });
        }else{
            outputDir = os.homedir() + '\\desktop\\output';
            writePath(files, outputDir)
        }
    })
    
    console.log('Output資料夾位置設定完成')
}