var postcss = require('postcss');
var autoPrefixer = require('autoprefixer');
var sprite = require('postcss-sprites').default;
var preCss = require('precss');
var scss = require('postcss-scss');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var style = glob.sync('{css/style-edit.css}', {matchBase:true});
var spriteMerge = [], mspriteMerge = [], selector, currselector, img;
var optsPrefixer = {browser: ['last 1 versions', 'ie 8-10']};
var optsSprite = {
	stylesheetPath: './css',
	spritePath: './images/',
	basePath: './css',
	relativeTo: 'rule',
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
			// console.log(image);
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
		onSaveSpritesheet: function(opts, groups) {
			groups.push('png');
			return path.join(opts.spritePath, groups.join('.'));
		}
	},
	spritesmith:{
		padding: 2
	}
};
function mergeSelector(rule){
	currselector = selector;
	selector = '.'+ currselector + (/(:after|:before)/.test(rule.selector) ? ', '+ rule.selector : '');
	if(spriteMerge.toString().indexOf(currselector) > -1){
		spriteMerge.filter(function(sprite, index, arr){
			var repeat = sprite.indexOf('.'+ currselector);
			var items = arr.slice(repeat, repeat+1).toString().split(',').length;
			var newItems = selector.split(',').length;
			if(repeat > -1){
				var defaultSelector = arr[index].split('{')[0];
				var addSelector = selector.split('.'+ currselector +', ')[1]== undefined ? '' : ', '+ selector.split('.'+ currselector+ ', ')[1];
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
	var today = String(new Date().toString()).slice(0, 21);
	var imgFolder = 'images/sprite';
	var imgChange =  String(fs.statSync(imgFolder).mtime).slice(0, 18);
	var css = fs.readFileSync(item);
	var goPath = item.slice(0, -14);
	var Processor = postcss([preCss(), sprite(optsSprite), autoPrefixer(optsPrefixer)]);
	var sprite2, sprite3;
	var cssFiles = glob.sync('./{'+ goPath +','+ goPath +'/sass}/*.css', {matchBase:true, ignore: ['./'+ goPath +'style.css']});
	var cssChange = cssFiles.some(function(item){
		return today == String(fs.statSync(item).mtime).slice(0, 18);
	});
	if(cssChange || today.slice(0, -3) == imgChange){
		console.log('產出sprite中...');
		Processor
		.process(css, {parser: scss, from: item, to: goPath +'style.css'})
		.then(function (result) {
			var resultStr = result.content;
			var sprite = spriteMerge.join('');
			sprite2 = '@media screen and (-webkit-min-device-pixel-ratio:2) {\r\n'+ sprite.replace(/.png/g, '@2x.png') +'}\r\n';
			sprite3 = '@media screen and (-webkit-min-device-pixel-ratio:3) {\r\n'+ sprite.replace(/.png/g, '@3x.png') +'}\r\n';
			sprite = sprite2.concat(sprite3)
			spriteMerge.push(sprite)
			result.css = resultStr
			.concat('\r'+ spriteMerge.join(''))
			.replace(/@media screen and.\(-webkit-min-device-pixel-ratio:\d\)(.)??\{}/g, '')
			.replace(/\.\.\/\.\.\//g, '../')
			fs.writeFileSync(goPath +'style.css', result.css);
			console.log('< sprite產出完成! 等待CSS存檔後再啟動... >');
		});
	}
});
process.on('exit', (code) => {
	if(code != 0){
		console.log('有地方出錯! task已停止');
	}
});