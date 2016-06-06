var postcss = require('postcss');
var mqpacker = require("css-mqpacker");
var nano = require('cssnano');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var style = glob.sync('**/?(css|mobile)/style.css', {matchBase:true});
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
