var postcss = require('postcss');
var nano = require('cssnano');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var style = glob.sync('**/style-edit.css', { matchBase: true });
var optsNano = { preset: 'default' };
var Processor = postcss([nano(optsNano)]);

function cssminProcessor(cssSourcePath) {
    var css = fs.readFileSync(cssSourcePath);
    var cssPath = cssSourcePath.replace('-edit', '');
    var cssSourcePath = cssSourcePath.replace('-edit', '-source');

    fs.writeFileSync(cssSourcePath, css);

    Processor
        .process(css, {
            from: cssSourcePath,
            to: cssPath
        })
        .then(function(result) {
            fs.writeFileSync(mapPath, result.map);
            fs.writeFileSync(cssPath, result.css);
        });
}

function cssmin(cssSourcePath) {
    if (typeof cssSourcePath == 'object') {
        cssSourcePath.forEach(function(item, index, arr) {
            cssminProcessor(item);
        });
    } else {
        cssminProcessor(cssSourcePath);
    }

    process.on('exit', (code) => {
        if (code != 0) {
            console.log('cssmin.js有地方出錯!');
        } else {
            console.log('CSS 壓縮完成!')
        }
    });
}

cssmin(style);
