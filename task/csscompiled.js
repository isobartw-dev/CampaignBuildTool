var postcss = require('postcss');
var scss = require('postcss-scss');
var sass = require('@csstools/postcss-sass');
var autoPrefixer = require('autoprefixer');
var sprite = require('postcss-sprites');
var rebase = require('postcss-url');
var fs = require('fs-extra');
var path = require('path');
var cssmin = require('./cssmin');
var imagesmin = require('./imagemin');
var spriteGroups = [];
var cssFile = getChangeFile('task/.changelog');
var optsSass = { outputStyle: 'expanded' };
var optsNano = { preset: 'default' };
var optsPrefixer = { browsers: ["last 1 versions", "> 5%"] };
var optsRebase = {
    url: function(asset, dir) {
        var fileParse = asset.url.split('/');
        var imagePath = path.posix.resolve(dir.to, fileParse.slice(1).join('/'));
        var cssPath = path.posix.resolve(dir.to)

        return path.posix.relative(cssPath, imagePath)
    }
};

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

            var backgroundImage = {
                type: 'decl',
                prop: 'background-image',
                value: 'url(' + image.spriteUrl + ')'
            };
            var backgroundSize = {
                type: 'decl',
                prop: 'background-size',
                value: Math.floor(backgroundSizeX * 10) / 10 + '% ' + Math.floor(backgroundSizeY * 10) / 10 + '%'
            };
            var backgroundPosition = {
                type: 'decl',
                prop: 'background-position',
                value: Math.floor(backgroundPositionX * 10) / 10 + '% ' + Math.floor(backgroundPositionY * 10) / 10 + '%'
            };
            var backgroundRepeat = {
                type: 'decl',
                prop: 'background-repeat',
                value: 'no-repeat'
            };

            token.cloneAfter(backgroundImage)
                .cloneAfter(backgroundPosition)
                .cloneAfter(backgroundSize)

            if (backgroundPositionX == 0 || backgroundPositionY == 0) {
                token.cloneAfter(backgroundRepeat)
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


function getChangeFile(file) {
    return path.dirname(fs.readFileSync(file, 'utf-8'))
        .replace(/\"/g, '')
        .split('\\')
        .filter(function(element) {
            if (!/sass/.test(element)) {
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
    var spritePath = (cssPath + '/images').replace('css/', '');
    return spritePath;
}

function cssProcess(cssFile) {
    var css = fs.readFileSync(cssFile, 'utf-8');
    var cssPath = getPath(cssFile) + '/style.css';
    var cssSourcePath = getPath(cssFile) + '/style-source.css';
    var mapPath = setMap(cssFile).replace(/\.\.\//g, '');

    var optsMap = {
        inline: false,
        sourcesContent: false,
        annotation: setMap(cssFile)
    };
    var Processor = postcss([sass(optsSass), rebase(optsRebase), sprite(optsSprite), autoPrefixer(optsPrefixer)]);


    console.log('==================================')
    console.log(cssPath + ' 產出中...')

    Processor
        .process(css, {
            from: cssFile,
            to: cssPath,
            map: optsMap
        })
        .then(function(result) {
            fs.writeFileSync(mapPath, result.map);
            fs.writeFileSync(cssSourcePath, result.css);

            if (spriteGroups.length > 0) {
                console.log('> 產出 ' + spriteGroups.length + ' 張 sprite!')
                imagesmin([setSprite(cssFile) + '/'], false);
            }

            cssmin(cssSourcePath);
        });
}

process.on('unhandledRejection', function(reason, p) {
    console.log('有無法處裡的錯誤 => ' + p);
    console.log('原因 => ' + reason);
})

fs.stat(cssFile, function(error, data) {
    if (error) {
        return
    }
})

cssProcess(cssFile);