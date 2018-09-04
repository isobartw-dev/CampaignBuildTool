var postcss = require('postcss');
var nano = require('cssnano');
var mqpacker = require("css-mqpacker");
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var style = glob.sync('{css/style.css,mobile/css/style.css}', {matchBase:true});
var opts_nano = {safe:true, autoprefixer:false};
var Processor = postcss([nano(opts_nano), mqpacker()]);

style.forEach(function(item, index, arr){
	var css = fs.readFileSync(item);
	Processor
	.process(css, {from: item, to: item})
	.then(function (result) {
		fs.writeFileSync(item, result.css);
  	});
});
process.on('exit', (code) => {
	if(code != 0){
		console.log('有地方出錯! task已停止');
	}
});