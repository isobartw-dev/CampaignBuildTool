var today = String(new Date().toString()).slice(4, 24);
var postcss = require('postcss');
var scss = require('postcss-scss');
var preCss = require('precss');
var autoPrefixer = require('autoprefixer');
var sprite = require('postcss-sprites');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var style = glob.sync('{css/style-edit.css,mobile/css/style-edit.css}', {matchBase:true});
var spriteMerge = [], mspriteMerge = [], selector, currselector, img, group, groups = [];
var optsPrefixer = {browsers: ['last 1 versions', 'ie 8-10']};
var optsSpritePc = {
	stylesheetPath: './css',
	spritePath: './images/',
	basePath: './css',
	groupBy: function(image) {
		group = image.url.split('_')[1].toString().slice(0, -4);
		if (image.url.indexOf(group) === -1) {
			return Promise.reject();
		}
		return Promise.resolve(group);
	},
	filterBy: function(image){
		if(!/sprite/.test(image.url)){
			return Promise.reject();
		}
		return Promise.resolve();
	},
	hooks: {
		onUpdateRule: function(rule, token, image) {
			selector = image.groups[1];
			img = image.spriteUrl;
			var backgroundPositionX = image.coords.x == 0 ? 0 : '-'+ image.coords.x;
			var backgroundPositionY = image.coords.y == 0 ? 0 : '-'+ image.coords.y;
			var backgroundPosition = postcss.decl({
				prop: 'background-position',
				value: backgroundPositionX +'px '+ backgroundPositionY +'px'
			});

			rule.append(backgroundPosition)
			mergeSelector(rule);
		},
		onSaveSpritesheet: function(opts, spritesheet) {
			groups.push(spritesheet.groups);
			var fileName = spritesheet.groups.concat(spritesheet.extension);
			return path.join(opts.spritePath, fileName.join('.'));
		}
	},
	spritesmith:{
		padding: 2
	}
};
var optsSpriteMobile = {
	stylesheetPath: './mobile/css',
	spritePath: './mobile/images',
	basePath: './mobile',
	groupBy: function(image) {
		group = image.url.split('_')[1].toString().slice(0, -4);
		if (image.url.indexOf(group) === -1) {
			return Promise.reject();
		}
		return Promise.resolve(group);
	},
	filterBy: function(image){
		if(!/sprite/.test(image.url)){
			return Promise.reject();
		}
		return Promise.resolve();
	},
	hooks: {
		onUpdateRule: function(rule, token, image) {
			selector = image.groups[1];
			img = image.spriteUrl;
			var backgroundSizeX = (image.spriteWidth / image.coords.width) * 100;
			var backgroundSizeY = (image.spriteHeight / image.coords.height) * 100;
			var backgroundPositionX = (image.coords.x / (image.spriteWidth - image.coords.width)) * 100;
			var backgroundPositionY = (image.coords.y / (image.spriteHeight - image.coords.height)) * 100;
			backgroundSizeX = isNaN(backgroundSizeX) ? 0 : backgroundSizeX;
			backgroundSizeY = isNaN(backgroundSizeY) ? 0 : backgroundSizeY;
			backgroundPositionX = isNaN(backgroundPositionX) ? 0 : backgroundPositionX;
			backgroundPositionY = isNaN(backgroundPositionY) ? 0 : backgroundPositionY;

			var backgroundSize = postcss.decl({
				prop: 'background-size',
				value: Math.floor(backgroundSizeX * 10) / 10 + '% ' + Math.floor(backgroundSizeY * 10) / 10 + '%'
			});
			var backgroundPosition = postcss.decl({
				prop: 'background-position',
				value: Math.floor(backgroundPositionX * 10) / 10 + '% ' + Math.floor(backgroundPositionY * 10) / 10 + '%'
			});
			var backgroundRepeat = postcss.decl({
				prop: 'background-repeat',
				value: 'no-repeat'
			});
			
			if(img.indexOf('@') === -1){
				mergeSelector(rule);
			}

			rule.insertAfter(token, backgroundPosition);
			rule.insertAfter(backgroundPosition, backgroundSize);

			if(backgroundPositionX == 0 || backgroundPositionY == 0){
				rule.insertAfter(backgroundSize, backgroundRepeat);
			}
		},
		onSaveSpritesheet: function(opts, spritesheet) {
			groups.push(spritesheet.groups);
			var fileName = spritesheet.groups.concat(spritesheet.extension);
			return path.join(opts.spritePath, fileName.join('.'));
		}
	},
	spritesmith:{
		padding: 2
	}
};
function mergeSelector(rule){
	currselector = selector;
	selector = '.'+ currselector + (/(:after|:before)/.test(rule.selector) ? ', '+ rule.selector : '');
	// console.log(spriteMerge, currselector);
	if(spriteMerge.toString().indexOf(currselector +'.png') > -1){
		spriteMerge.filter(function(sprite, index, arr){
			var repeat = sprite.split(',')[0].indexOf('.'+ currselector);
			var items = arr.slice(repeat, repeat+1).toString().split(',').length;
			var newItems = selector.split(',').length;
			if(repeat > -1){
				var defaultSelector = arr[index].split('{')[0];
				var addSelector = selector.split('.'+ currselector +', ')[1] == undefined ? '' : ', '+ selector.split('.'+ currselector+ ', ')[1];
				return arr.splice(index, 1, defaultSelector + addSelector +'{background-image:url('+ img +');}\r\n')
			}else{
				return arr
			}
		});
	}else{
		spriteMerge.push(selector +'{background-image:url('+ img +');}\r\n');
	}
}
style.forEach(function(item, index, arr){
	var imgFolder = /mobile/.test(item) ? 'mobile/images/sprite' : 'images/sprite';
	var imgChange =  String(fs.statSync(imgFolder).ctime).slice(4, 21);
	var css = fs.readFileSync(item);
	var goPath = item.slice(0, -14)
	var optsMap = {inline: false, sourcesContent:false};
	var optsSprite = /mobile/.test(item) ? optsSpriteMobile : optsSpritePc;
	var Processor = postcss([preCss(), autoPrefixer(optsPrefixer)]);
	var ProcessorSprite = postcss([sprite(optsSprite)]);
	var sort = /mobile/.test(item) ? 'mobile': 'pc';
	var sprite2, sprite3;
	var cssFiles = glob.sync('./{'+ goPath +','+ goPath +'/sass}/*.css', {matchBase:true, ignore: ['./'+ goPath +'style.css']});
	var cssChange = cssFiles.some(function(item){
		// console.log(sort, today, String(fs.statSync(item).mtime).slice(4, 24));
		return today == String(fs.statSync(item).mtime).slice(4, 24);
	});
	
	if(cssChange){
		console.log(sort +' 產出 style 中...');
		Processor
		.process(css, {parser: scss, from: item, to: goPath +'style.css', map: optsMap})
		.then(function (result) {
			result.css = result.content
			.replace(/(\.\.\/)+/g, '../');
			fs.writeFile(goPath +'style.css', result.css, function(){
				css = fs.readFileSync(goPath +'style.css');
				ProcessorSprite
				.process(css, {from: goPath +'style.css', to: goPath +'style.css'})
				.then(function (result) {
					var resultStr = result.content;
					if(sort != 'mobile'){
						result.css = resultStr
						.concat('\r'+ spriteMerge.join(''))
						.replace(/(\.\.\/)+/g, '../');
					}else{
						var sprite = spriteMerge.join('');
						sprite2 = '@media screen and (-webkit-min-device-pixel-ratio:2) {\r\n'+ sprite.replace(/\.png$/ig, '@2x.png') +'}\r\n';
						sprite3 = '@media screen and (-webkit-min-device-pixel-ratio:3) {\r\n'+ sprite.replace(/\.png$/ig, '@3x.png') +'}\r\n';
						sprite = sprite2.concat(sprite3);
						spriteMerge.push(sprite);
						result.css = resultStr
						.concat('\r'+ spriteMerge.join(''))
						.replace(/@media screen and \(-webkit-min-device-pixel-ratio:\d\)(.)??\{}/g, '')
						.replace(/(\.\.\/)+/g, '../')
					};
					fs.writeFileSync(goPath +'style.css', result.css);
					groups.length > 0 ? console.log('< '+ groups.length +' 張 sprite 產出完成! 等待 CSS 存檔後再啟動... >') : console.log('< style 產出完成! 等待 CSS 存檔後再啟動... >');
				});
			});
			fs.writeFileSync(goPath +'style.css.map', result.map);
		});
	}
});
process.on('exit', (code) => {
	if(code != 0){
		console.log('有地方出錯! task已停止');
	}
});