var postcss = require('postcss');
var nano = require('cssnano');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var style = glob.sync('**/style-source.css', { matchBase: true });
var opts_nano = { preset: 'default' };
var Processor = postcss([nano(opts_nano)]);

module.exports = cssmin;

function cssminProcessor(cssSourcePath) {
    var css = fs.readFileSync(cssSourcePath);
    var cssPath = cssSourcePath.replace('-source', '');
    var mapPath = 'source-map/' + cssPath + '.map';
    var mapAnnotation = path.relative(path.dirname(cssPath), mapPath).replace(/\\/g, '/');

    Processor
        .process(css, {
            from: cssSourcePath,
            to: cssPath,
            map: {
                inline: false,
                sourcesContent: false,
                annotation: mapAnnotation
            }
        })
        .then(function(result) {
            fs.writeFileSync(mapPath, result.map);
            fs.writeFileSync(cssPath, result.css);
        });
}

function cssmin(cssSourcePath, self) {
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
            if (!self) {
                console.log('> style 產出完成! 待 CSS 存檔後再啟動...');
                fs.writeFileSync('task/.changelog', '');
            } else {
                console.log('CSS 壓縮完成!')
            }
        }
    });
}

if (require.main === module) {
    cssmin(style, true);
} else {
    module.exports = cssmin;
}
