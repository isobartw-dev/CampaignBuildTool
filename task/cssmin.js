<<<<<<< HEAD:task/cssmin.js
var postcss = require('postcss');
var mqpacker = require("css-mqpacker");
var postcss = require('postcss');
var mqpacker = require("css-mqpacker");
var nano = require('cssnano');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var style = glob.sync('**/style.css', { matchBase: true });
var opts_nano = { preset: 'default' };
var Processor = postcss([nano(opts_nano), mqpacker()]);

style.forEach(function(item, index, arr) {
	var css = fs.readFileSync(item);
	Processor
		.process(css, { from: item, to: item })
		.then(function(result) {
			fs.writeFileSync(item, result.css);
		});
});
process.on('exit', (code) => {
	if (code != 0) {
		console.log('有地方出錯! task已停止');
	}
});