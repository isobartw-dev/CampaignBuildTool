var fs = require('fs');
var path = require('path');

exports = module.exports = {};
exports.writeTime = function () {
  fs.stat('task/log.txt', function (err, stat) {
    var endTime = String(new Date().toString()).slice(4, 24);
    var data = '[image]\t' + endTime;

    if (err == null) {
      var readLog = fs
        .readFileSync('task/log.txt')
        .toString()
        .split('\r');

      if (readLog) {
        var line = readLog.findIndex(function (value, index, obj) {
          return value.indexOf('[image]') > -1;
        });

        // console.log(line);

        if (line !== -1) {
          readLog.splice(line, 1, data);
          fs.writeFileSync('task/log.txt', readLog.join('\r'), 'utf8');
        } else {
          fs.appendFileSync('task/log.txt', data + '\r');
        }
      }
    } else if (err.code === 'ENOENT') {
      var createLog = fs.createWriteStream('task/log.txt');
      createLog.write(data);
    }
    console.log('時間戳記已寫入');
  });
};
exports.writeIISData = function () {
  var glob = require('glob');
  var dir = path.dirname(__dirname);
  var file = dir + '\\' + glob.sync('**/*.sln', {matchBase: true, ignore: '**/node_modules/**'}).toString();
  var data = fs.readFileSync(file, 'utf8').split('\r');

  function writeData (type, text, message) {
    var data = '[' + type + ']\t' + text.split('"')[1].replace(/(\\|\/|\.\.\\|\.\.\/)/g, '');

    fs.stat('task/log.txt', function (error, stat) {
      if (error == null) {
        var readLog = fs
          .readFileSync('task/log.txt')
          .toString()
          .split('\r');

        // console.log(readLog, type);

        if (readLog) {
          var line = readLog.findIndex(function (value, index, obj) {
            return value.indexOf(type) > -1;
          });

          // console.log(line);

          if (line !== -1) {
            readLog.splice(line, 1, data);
            fs.writeFileSync('task/log.txt', readLog.join('\r'), 'utf8');
          } else {
            fs.appendFileSync('task/log.txt', data + '\r');
          }
        }
      } else if (error.code === 'ENOENT') {
        var createLog = fs.createWriteStream('task/log.txt');
        createLog.write(data);
      }
    });
  }

  data.forEach(function (text, index, array) {
    if (text.match(/VWDPort/)) {
      writeData('port', text, '獲取 local port');
    } else if (text.match(/SlnRelativePath/)) {
      writeData('project', text, '獲取 project name');
    }
  });
};
exports.get = function (sort) {
  var readLog = fs.readFileSync('task/log.txt').toString();
  if (readLog) {
    var readLine = readLog.split('\r');
    var get = readLine.find(function (item) {
      return item.indexOf(sort) > -1;
    });
    if (get) {
      return get.toString().split('\t')[1];
    }
  } else {
    switch (sort) {
      case 'image':
        console.log('沒有圖片壓縮日期，壓縮全部圖片');
        break;
      case 'port' || 'project':
        console.log('沒有 ' + sort + ' 值，請先執行 runIIS 指令');
        break;
    }
  }
};
