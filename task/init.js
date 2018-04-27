var fs = require('fs');
var glob = require('glob');
var imgFolder = glob.sync('**/images/', { matchBase: true, ignore: 'node_modules/**' });
var cssFolder = glob.sync('**/css/', { matchBase: true, ignore: ['node_modules/**', 'source-map/**'] });
var cssNew = { dir: ['sass'], copy: ['style-edit.css'] };
var log = require('./log');

function newItem(path, name, type) {
	var sort = path.indexOf('mobile') > -1 ? 'mobile' : 'pc';
	switch (typeof name) {
		case 'string':
			fs.stat(path + name, function(err, stats) {
				if (err) {
					if (err.code === 'ENOENT') {
						fs.mkdirSync(path + name);
						console.log(sort + ' | 建立' + name);
					}
				} else {
					console.log(sort + ' | ' + name + '已存在');
					return
				}
			})
			break;
		case 'object':
			name.forEach(function(item, index, arr) {
				fs.stat(path + item, function(err, stats) {
					if (err) {
						if (err.code === 'ENOENT') {
							if (type == 'folder') {
								fs.mkdirSync(path + item);
							} else if (type == 'copy') {
								fs.renameSync(path + item.split('-')[0] + '.css', path + item);
							}

							item.indexOf('source') === -1 ? console.log(sort + ' | 建立' + item) : console.log('建立 ' + item);
						}
					} else {
						item.indexOf('source') === -1 ? console.log(sort + ' | ' + item + '已存在') : console.log(item + '已存在');
						return
					}
				});
			});
			break;
	}

}

imgFolder.forEach(function(item, index, arr) {
	newItem(item, 'sprite', 'folder');
})

cssFolder.forEach(function(item, index, arr) {
	newItem(item, cssNew['dir'], 'folder');
	newItem(item, cssNew['copy'], 'copy');
})

newItem(__dirname.replace('task', ''), ['source-map', 'source-map/css', 'source-map/mobile/css'], 'folder');

log.writeTime();
log.setImgDir();