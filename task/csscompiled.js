var sass = require('node-sass');
var globImporter = require('node-sass-glob-importer');
var postcss = require('postcss');
var autoPrefixer = require('autoprefixer');
var sprite = require('postcss-sprites');
var rebase = require('postcss-url');
var stylelint = require('stylelint');
var nano = require('cssnano');
var fs = require('fs');
var path = require('path');
var imagesmin = require('./imagemin');
var spriteGroups = [];
var file = fs.readFileSync('task/.changelog', 'utf-8');
var mainFile = changeFile('task/.changelog');
var optsNano = {preset: 'default'};
var optsPrefixer = {browserslist: ['last 1 versions', '> 5%']};
var optsRebase = {
  url: function (asset, dir) {
    var fileParse = asset.url.split('/');
    var imagePath = path.posix.resolve(dir.to, fileParse.slice(1).join('/'));
    var cssPath = path.posix.resolve(dir.to);

    return path.posix.relative(cssPath, imagePath);
  }
};
var optsSprite = {
  stylesheetPath: './' + dirPath(mainFile).split(/css|sass/)[0] + 'css',
  spritePath: './' + dirPath(mainFile).split(/css|sass/)[0] + 'images',
  basePath: './' + dirPath(mainFile).split(/css|sass/)[0],
  // verbose: true,
  groupBy: function (image) {
    var spriteGroup = image.url
      .split('_')[1]
      .toString()
      .slice(0, -4);
    if (image.url.indexOf(spriteGroup) === -1) {
      return Promise.reject();
    }
    return Promise.resolve(spriteGroup);
  },
  filterBy: function (image) {
    if (!/sprite/.test(image.url)) {
      return Promise.reject();
    }
    return Promise.resolve();
  },
  hooks: {
    onUpdateRule: function (rule, token, image) {
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

      token
        .cloneAfter(backgroundImage)
        .cloneAfter(backgroundPosition)
        .cloneAfter(backgroundSize);

      if (backgroundPositionX === 0 || backgroundPositionY === 0) {
        token.cloneAfter(backgroundRepeat);
      }
    },
    onSaveSpritesheet: function (opts, spritesheet) {
      spriteGroups.push(spritesheet.groups);
      var fileName = spritesheet.groups.concat(spritesheet.extension);
      return path.join(opts.spritePath, fileName.join('.'));
    }
  },
  spritesmith: {
    padding: 2
  }
};
var success = false;

function changeFile (file) {
  var apart = path
    .dirname(fs.readFileSync(file, 'utf-8'))
    .replace(/\\"/g, '')
    .split('\\');
  var sassIndex = apart.indexOf('sass');
  var cssIndex = apart.indexOf('css');
  var hasCss = cssIndex > -1;

  if (hasCss) {
    apart.splice(sassIndex, apart.length);
    return apart.join('/') + '/style-edit.css';
  } else {
    apart.splice(sassIndex, apart.length, 'sass');
    return apart.join('/') + '/style-edit.scss';
  }
}

function dirPath (file, dist) {
  if (dist) {
    return path.dirname(file).replace('sass', 'css');
  } else {
    return path.dirname(file);
  }
}

function spritePath (cssFile) {
  var cssPath = dirPath(cssFile, true);
  var spritePath = (cssPath + '/images').replace('css/', '');
  return spritePath;
}

function mapAnnotation (cssFile) {
  var cssPath = dirPath(cssFile, true);
  var mapPath = 'source-map/' + cssPath + '/style.css.map';
  return path.relative(cssPath, mapPath).replace(/\\/g, '/');
}

function lintCheck (cssFile) {
  stylelint
    .lint({
      code: fs.readFileSync(cssFile, 'utf-8'),
      codeFilename: cssFile,
      formatter: 'string'
    })
    .then(function (data) {
      if (data.errored === true) {
        console.log(data.output);
      } else {
        console.log('[stylelint] 格式驗證完成!');
        // console.log(styleFile, mainFile, file);
        compile(mainFile);
      }
    })
    .catch(function (err) {
      // do things with err e.g.
      console.log('[stylelint] 有其他錯誤!');
      console.error(err);
    });
}

function compile (cssFile) {
  var cssPath = dirPath(cssFile, true) + '/style.css';
  var cssSourcePath = dirPath(cssFile, true) + '/style-source.css';
  var mapPath = mapAnnotation(cssFile).replace(/\.\.\//g, '');
  var sassPath = function (file) {
    var apart = dirPath(file).split(path.sep);
    var sassIndex = apart.indexOf('sass');

    if (sassIndex < apart.length - 1) {
      apart = apart.slice(sassIndex, sassIndex + 1);
    }
    return apart.join('/').split();
  };

  var sassResult = sass.renderSync({
    outFile: cssPath,
    file: cssFile,
    importer: globImporter(),
    includePaths: sassPath(file),
    outputStyle: 'expanded',
    sourceMap: mapPath,
    sourceMapRoot: 'css'
  });
  var optsMap = {
    prev: sassResult.map.toString(),
    inline: false,
    annotation: mapAnnotation(cssFile)
  };
  var Processor = postcss([rebase(optsRebase), sprite(optsSprite), autoPrefixer(optsPrefixer), nano(optsNano)]);

  console.log('==================================');
  console.log(cssPath + ' 產出中...');

  fs.writeFileSync(cssSourcePath, sassResult.css);

  Processor.process(sassResult.css, {
    from: cssFile,
    to: cssPath,
    map: optsMap
  }).then(function (result) {
    fs.writeFileSync(mapPath, result.map);
    fs.writeFileSync(cssPath, result.css);

    if (spriteGroups.length > 0) {
      console.log('> 產出 ' + spriteGroups.length + ' 張 sprite!');
      imagesmin.imageCheck([spritePath(cssFile) + '/'], false, 'css');
    }

    success = true;
  });
}

process
  .on('unhandledRejection', function (reason, p) {
    console.log('有無法處裡的錯誤 => ' + p);
    console.log('原因 => ' + reason);
  })
  .on('exit', function () {
    if (success) {
      console.log('> style 產出完成! 待 CSS 存檔後再啟動...');
    } else {
      console.log('> 待 CSS 存檔後再啟動...');
    }
    fs.writeFileSync('task/.changelog', '');
  });

if (file) {
  fs.stat(mainFile, function (error, data) {
    if (!error) {
      lintCheck(file);
    } else {
      if (mainFile.indexOf('sass') > -1) {
        mainFile = mainFile.replace(/sass(\/\S+.)scss/, 'css$1css');
      } else {
        mainFile = mainFile.replace(/css(\/\S+.)css/, 'sass$1scss');
      }

      lintCheck(file);
    }
  });
}
