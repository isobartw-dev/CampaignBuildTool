var fs = require('fs-extra');
var glob = require('glob');
var imgFolder = glob.sync('**/images/', {matchBase: true, ignore: 'node_modules/**'});
var cssFolder = glob.sync('**/css/', {matchBase: true, ignore: ['node_modules/**', 'source-map/**']});
var cssNew = {dir: ['sass'], copy: ['style-edit.css']};
var log = require('./log');
var setting = require('./setting');

function newItem (path, name, type) {
  var sort = path.indexOf('mobile') > -1 ? 'mobile' : 'pc';
  switch (typeof name) {
    case 'string':
      fs.stat(path + name, function (err, stats) {
        if (err) {
          if (err.code === 'ENOENT') {
            fs.mkdirsSync(path + name);
            console.log(sort + ' | 建立 ' + path + name);
          }
        } else {
          console.log(sort + ' | ' + path + name + ' 已存在');
        }
      });
      break;
    case 'object':
      name.forEach(function (item, index, arr) {
        fs.stat(path + item, function (error, stats) {
          if (error) {
            if (error.code === 'ENOENT') {
              switch (type) {
                case 'folder':
                  fs.mkdirsSync(path + item);
                  break;
                case 'copy':
                  fs.stat(path + item.split('-')[0] + '.css', function (error) {
                    if (error) {
                      fs.writeFileSync(path + item, '');
                    } else {
                      fs.renameSync(path + item.split('-')[0] + '.css', path + item);
                    }
                  });
                  break;
              }

              item.indexOf('source') === -1 ? console.log(sort + ' | 建立 ' + path + item) : console.log('建立 ' + path + item);
            }
          } else {
            item.indexOf('source') === -1 ? console.log(sort + ' | ' + path + item + ' 已存在') : console.log(path + item + ' 已存在');
          }
        });
      });
      break;
  }
}

imgFolder.forEach(function (path, index, array) {
  newItem(path, 'sprite', 'folder');
});

cssFolder.forEach(function (path, index, array) {
  newItem(path, cssNew['dir'], 'folder');
  newItem(path, cssNew['copy'], 'copy');

  fs.stat('source-map', function (error, stats) {
    if (error) {
      fs.mkdirsSync('source-map');
    }

    newItem('source-map/', path, 'folder');
  });
});

setting.setImgDir();
log.writeTime();
