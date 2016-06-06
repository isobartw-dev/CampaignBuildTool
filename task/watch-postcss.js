var postcss = require('postcss');
var autoPrefixer = require('autoprefixer');
var sprite = require('postcss-sprites').default;
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var style = glob.sync('**/?(css|mobile)/style-edit.css', {matchBase:true});
var spriteMerge = [], selector, currselector, img; 
var optsPrefixer = {browser: ['last 1 versions', 'ie 8']};
var optsSpritePc = {
	stylesheetPath: './css',
	spritePath: './images/',
	basePath: './css',
	groupBy: function(image) {
		var groups = image.url.split('_')[1].toString().slice(0, -4);
		if (image.url.indexOf(groups) === -1) {
			return Promise.reject();
		}
		return Promise.resolve(groups);
	},
	filterBy: function(image){
		if(!/sprite/.test(image.url)){
			return Promise.reject();
		}
		return Promise.resolve();
	},
	hooks: {
		onUpdateRule: function(rule, token, image) {
			selector = image.groups.toString();
			img = image.spriteUrl;
			var backgroundPositionX = image.coords.x;
			var backgroundPositionY = image.coords.y;
			var backgroundPosition = postcss.decl({
				prop: 'background-position',
				value: backgroundPositionX +'px '+ backgroundPositionY +'px'
			});

			rule.append(backgroundPosition)
			if (selector != currselector){
				currselector = selector;
				selector = '.'+ currselector + (/(:after|:before)/.test(rule.selector) ? ', '+ rule.selector : '');
				spriteMerge.push(selector +'{background-image:url('+ img +');}\r\n');
			}
		},
		onSaveSpritesheet: function(opts, groups) {
			groups.push('png');
			return path.join(opts.spritePath, groups.join('.'));
		}
	}
};
var optsSpriteMobile = {
	stylesheetPath: './mobile/css',
	spritePath: './mobile/images/',
	basePath: './mobile/css',
	groupBy: function(image) {
		var groups = image.url.split('_')[1].toString().slice(0, -4);
		if (image.url.indexOf(groups) === -1) {
			return Promise.reject();
		}
		return Promise.resolve(groups);
	},
	filterBy: function(image){
		if(!/sprite/.test(image.url)){
			return Promise.reject();
		}
		return Promise.resolve();
	},
	hooks: {
		onUpdateRule: function(rule, token, image) {
			selector = image.groups.toString();
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
			if(img.indexOf('@') > -1){
				rule.remove()
				var ratio = selector.slice(-2, -1);
				if (selector != currselector){
					currselector = selector;
					selector = '.'+ currselector.slice(0, -3) + (/(:after|:before)/.test(rule.selector) ? ', '+ rule.selector : '');
					spriteMerge.push('@media screen and (-webkit-min-device-pixel-ratio:'+ ratio +') {'+ selector +'{background-image:url('+ img +');}}\r\n')
				}
			}else if(backgroundPositionX == 0 && backgroundPositionY == 0){
				rule.insertAfter(token, backgroundSize);
			}else{
				if (selector != currselector){
					currselector = selector;
					selector = '.'+ currselector + (/(:after|:before)/.test(rule.selector) ? ', '+ rule.selector : '');
					spriteMerge.push(selector +'{background-image:url('+ img +');}\r\n')
				}
				rule.insertAfter(token, backgroundPosition);
				rule.insertAfter(backgroundPosition, backgroundSize);
			};
		},
		onSaveSpritesheet: function(opts, groups) {
			groups.push('png');
			return path.join(opts.spritePath, groups.join('.'));
		}
	},
	spritesmith:{
		padding: 1
	}
};
style.forEach(function(item, index, arr){
	var today = String(new Date().toString()).slice(0, 18);
	var cssChange = String(fs.statSync(item).ctime).slice(0, 18);
	var imgFolder = /mobile/.test(item) ? 'mobile/images/sprite' : 'images/sprite';
	var imgChange =  String(fs.statSync(imgFolder).ctime).slice(0, 18);
	var css = fs.readFileSync(item);
	var toPath = item.slice(0, -14)
	var optsSprite = /mobile/.test(item) ? optsSpriteMobile : optsSpritePc;
	var Processor = postcss([sprite(optsSprite), autoPrefixer(optsPrefixer)]);
	var sort = /mobile/.test(item) ? 'mobile': 'pc';
	if(today == cssChange || today == imgChange){
		console.log(sort +' spritesheets generating...');
		Processor
		.process(css, {from: item, to: toPath +'style.css'})
		.then(function (result) {
			result.css = result.content
			.replace('body', spriteMerge.join('') +'body')
			.replace('@media screen and (-webkit-min-device-pixel-ratio:2) {\r\n}\r\n', '')
			.replace('@media screen and (-webkit-min-device-pixel-ratio:3) {\r\n}\r\n', '')
			fs.writeFileSync(toPath +'style.css', result.css);
			console.log('< process complete! restarting due to changes... >');
		});
	}
});