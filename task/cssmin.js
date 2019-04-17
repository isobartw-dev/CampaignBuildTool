var postcss = require('postcss');
var nano = require('cssnano');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var style = glob.sync('**/style-edit.css', {matchBase: true});
var optsNano = {preset: 'default'};
var Processor = postcss([nano(optsNano)]);

function cssminProcessor (cssEditPath) {
  var css = fs.readFileSync(cssEditPath);
  var cssPath = cssEditPath.replace('-edit', '');
  var cssSourcePath = cssEditPath.replace('-edit', '-source');
  var mapPath = 'source-map/' + cssPath;
  var optsMap = {
    inline: false,
    annotation: path.relative(cssPath, mapPath)
  };

  fs.writeFileSync(cssSourcePath, css);

  Processor.process(css, {
    from: cssSourcePath,
    to: cssPath,
    map: optsMap
  }).then(function (result) {
    fs.writeFileSync(mapPath, result.map);
    fs.writeFileSync(cssPath, result.css);
  });
}

function cssmin (cssEditPath) {
  if (typeof cssEditPath === 'object') {
    cssEditPath.forEach(function (item, index, arr) {
      cssminProcessor(item);
    });
  } else {
    cssminProcessor(cssEditPath);
  }

  process.on('exit', code => {
    if (code !== 0) {
      console.log('cssmin.js有地方出錯!');
    } else {
      console.log('CSS 壓縮完成!');
    }
  });
}

cssmin(style);
