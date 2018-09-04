var postcss = require('postcss');
var scss = require('postcss-scss');
var sass = require('@csstools/postcss-sass');
var autoPrefixer = require('autoprefixer');
var sprite = require('postcss-sprites');
var fs = require('fs');
var path = require('path');
var spriteGroups = [];
var cssFile = getFile('task/css.txt');
var optsSass = { outputStyle: 'expanded' };
var optsPrefixer = { browsers: ['last 1 versions', 'ie 8-10'] };
var optsSprite = {
	stylesheetPath: './' + getPath(cssFile).split('css')[0] + 'css',
	spritePath: './' + getPath(cssFile).split('css')[0] + 'images',
	basePath: './' + getPath(cssFile).split('css')[0],
	// verbose: true,
	groupBy: function(image) {
		spriteGroup = image.url.split('_')[1].toString().slice(0, -4);
		if (image.url.indexOf(spriteGroup) === -1) {
			return Promise.reject();
		}
		return Promise.resolve(spriteGroup);
	},
	filterBy: function(image) {
		if (!/sprite/.test(image.url)) {
			return Promise.reject();
		}
		return Promise.resolve();
	},
	hooks: {
		onUpdateRule: function(rule, token, image) {
			var backgroundSizeX = (image.spriteWidth / image.coords.width) * 100;
			var backgroundSizeY = (image.spriteHeight / image.coords.height) * 100;
			var backgroundPositionX = (image.coords.x / (image.spriteWidth - image.coords.width)) * 100;
			var backgroundPositionY = (image.coords.y / (image.spriteHeight - image.coords.height)) * 100;
			backgroundSizeX = isNaN(backgroundSizeX) ? 0 : backgroundSizeX;
			backgroundSizeY = isNaN(backgroundSizeY) ? 0 : backgroundSizeY;
			backgroundPositionX = isNaN(backgroundPositionX) ? 0 : backgroundPositionX;
			backgroundPositionY = isNaN(backgroundPositionY) ? 0 : backgroundPositionY;

			var backgroundImage = postcss.decl({
				raws: rule.nodes[0].raws,
				prop: 'background-image',
				value: 'url(' + image.spriteUrl + ')'
			});
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
			var newSelector = rule.selectors.join(',');
			var newNode = postcss.rule({
				raws: rule.parent.raws,
				selector: '.' + image.groups[1].split('@')[0],
				nodes: [backgroundImage]
			});

			if (newSelector.indexOf(':') > -1) {
				rule.insertAfter(token, backgroundImage);
				rule.insertAfter(backgroundImage, backgroundPosition);
				rule.insertAfter(backgroundPosition, backgroundSize);
			} else {
				rule.insertAfter(token, backgroundPosition);
				rule.insertAfter(backgroundPosition, backgroundSize);
				rule.after(newNode);
			}

			if (backgroundPositionX == 0 || backgroundPositionY == 0) {
				rule.insertAfter(backgroundSize, backgroundRepeat);
			}
		},
		onSaveSpritesheet: function(opts, spritesheet) {
			spriteGroups.push(spritesheet.groups);
			var fileName = spritesheet.groups.concat(spritesheet.extension);
			return path.join(opts.spritePath, fileName.join('.'));
		}
	},
	spritesmith: {
		padding: 2
	}

};

function getFile(file) {
	return path.dirname(fs.readFileSync(file, 'utf-8'))
		.split('\\')
		.map(function(element) {
			if (!/sass/g.test(element)) {
				return element;
			}
		}).join('/') + '/style-edit.css';
}

function getPath(file) {
	return path.dirname(file);
}

function setMap(cssFile) {
	var cssPath = getPath(cssFile);
	var mapPath = 'source-map/' + cssPath + '/style.css.map';
	return path.relative(cssPath, mapPath).replace(/\\/g, '/');
}

function setSprite(cssFile) {
	var cssPath = getPath(cssFile);
	var spritePath = (cssPath + 'images').replace('css/', '');
	return path.relative(cssPath, spritePath).replace(/\\/g, '/');
}

function cssProcess(cssFile) {
	var css = fs.readFileSync(cssFile, 'utf-8');
	var cssPath = getPath(cssFile) + '/style.css';
	var mapPath = setMap(cssFile).replace(/\.\.\//g, '');
	var spritePath = setSprite(cssFile);
	var sort = /mobile/.test(cssPath) ? 'mobile' : 'pc';
	var optsMap = { inline: false, sourcesContent: false, annotation: setMap(cssFile) };
	var Processor = postcss([sass(optsSass), autoPrefixer(optsPrefixer)]);
	var ProcessorSprite = postcss([sprite(optsSprite)]);
	var sprite2, sprite3;

	console.log(sort + ' 產出 style 中...');
	Processor
		.process(css, { from: cssFile, to: cssPath, map: optsMap })
		.then(function(result) {
			result.css = result.content.replace(/(\.\.\/)+images/g, spritePath);
			fs.writeFileSync(mapPath, result.map);
			fs.writeFile(cssPath, result.css, function() {
				css = fs.readFileSync(cssPath, 'utf-8');
				ProcessorSprite
					.process(css, { from: cssPath, to: cssPath, map: optsMap })
					.then(function(result) {
						fs.writeFileSync(cssPath, result.css);
						spriteGroups.length > 0 ? console.log('< style 產出完成! ' + spriteGroups.length + ' 張 sprite 產出完成! 等待 CSS 存檔後再啟動... > - ') : console.log('< style 產出完成! 等待 CSS 存檔後再啟動... > - ');
					});
			});
		});
}

cssProcess(cssFile);

process.on('exit', (code) => {
	if (code != 0 && code <= 128) {
		console.log('有地方出錯! task已停止');
	} else if (code > 128) {
		console.log('離開');
	}
})