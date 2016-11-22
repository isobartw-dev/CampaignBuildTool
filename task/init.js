var fs = require('fs');
var glob = require('glob');
var imgFolder = glob.sync('{images/,mobile/images/}', {matchBase:true});
var cssFolder = glob.sync('{css/,mobile/css/}', {matchBase:true});
var cssNew = {dir: ['sass'], copy: ['style-edit.css']};
var log = require('./log');

function newItem(path, name, type){
	switch(typeof name){
		case 'string':
			fs.stat(path+name, function(err, stats){
				if(err.code == 'ENOENT'){
					fs.mkdirSync(path+name);
				}else{
					console.log(name +'已存在');
					return
				}
			})
			break;
		case 'object':
			name.forEach(function(item, index, arr){
				fs.stat(path+name, function(err, stats){
					if(err.code == 'ENOENT'){
						if(type == 'folder'){
							fs.mkdirSync(path+name);
						}else if(type == 'copy'){
							fs.renameSync(path+item.split('-')[0] +'.css', path+item);
						}
					}else{
						console.log(name +'已存在');
						return
					}
				});
			});
			break;
	}

}

imgFolder.forEach(function(item, index, arr){
	newItem(item, 'sprite', 'folder');
})

cssFolder.forEach(function(item, index, arr){
	newItem(item, cssNew['dir'], 'folder');
	newItem(item, cssNew['copy'], 'copy');
})

log.writeTime();