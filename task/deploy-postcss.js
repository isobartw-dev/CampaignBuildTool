var postcss = require('postcss');
var mqpacker = require("css-mqpacker");
var nano = require('cssnano');
var clean = require('postcss-clean');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var style = glob.sync('**/?(css|mobile)/style.css', {matchBase:true});
var opts_clean = {keepBreaks:true};
var opts_nano = {safe:true, autoprefixer:false};
// var Processor = postcss([clean(opts_clean), mqpacker()]);
var Processor = postcss([clean(opts_clean), mqpacker]);
var css = fs.readFileSync('css/style.css');
var root  = postcss.parse(css);
var selector = [];
var rule = root.first;
var selectors = [];
var margin = postcss.plugin('postcss-remove', function (opts) {
    opts = opts || {};
    var filter = opts.prop || 'z-index';
    return function (css, result) {
        css.walkDecls(filter, function (decl) {
            decl.remove();
        });
    };
});
postcss([ remove({ prop: 'background-image' })])
	.process(css, {from: 'css/style.css', to: 'css/style.css'})
	.then(function (result) {
		// console.log(result)
		// var root = postcss.parse(css);
		fs.writeFileSync('css/style.css', result.css);
	});
// root.walkRules(function (rule) {
//     selectors.push(rule.selector);
// });
// root.walkDecls(function (decl) {
// 	if ( decl.value.match(/nav/) ) {
// 		decl.remove();
// 	}
// }).then(function (result) {
// 	fs.writeFileSync('css/style.css', result.css);
// })
// root.toResult({to: 'css/style.css'}).css;
// console.log(selectors);
// console.log(root.nodes[0].selector);
// style.forEach(function(item, index, arr){
// 	var css = fs.readFileSync(item);
// 	Processor
// 	.process(css, {from: item, to: item})
// 	.then(function (result) {
// 		fs.writeFileSync(item, result.css);
//   	});
// })
// postcss
	// .process(css, {from: 'css/style.css', to: 'css/style.css'})
	// .then(function (result) {
	// 	// console.log(result)
	// 	// var root = postcss.parse(css);
	// 	fs.writeFileSync('css/style.css', result.css);
	// });
