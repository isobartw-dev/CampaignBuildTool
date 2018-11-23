var postcss = require('postcss');
var nano = require('cssnano');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var style = glob.sync('**/style.css', { matchBase: true });
var opts_nano = { preset: 'default' };
var Processor = postcss([nano(opts_nano)]);
var options = {
	map:,
	cssPath:
};

module.exports = cssmin;

function cssminProcessor (){
	var css = fs.readFileSync(style);

	Processor
	    .process(css, {
	        from: cssSourcePath,
	        to: cssPath,
	        map: optsMap
	    })
	    .then(function(result) {
	        fs.writeFileSync(mapPath, result.map);
	        fs.writeFileSync(cssPath, result.css);
	    });
}

function cssmin(style, options) {
	if(typeof style == 'object'){
		style.forEach(function(item, index, arr) {
		    cssminProcessor();
		});
	}else{
		cssminProcessor();
	}

	process.on('exit', (code) => {
	    if (code != 0) {
			console.log('cssmin.js有地方出錯!');
	    }else{
			if(!self){
				console.log('< style 產出完成! 等待 CSS 存檔後再啟動... >');
			}else{
				console.log('CSS壓縮完成')
			} 
		}
	});
}(style, options);