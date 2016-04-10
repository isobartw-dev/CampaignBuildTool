var imagemin = require('imagemin');
var pngquant = require('imagemin-pngquant');
var jpegrecompress = require('imagemin-jpeg-recompress');
var fs = require('fs');
var path = require('path');
var images = ['./images/', './mobile/images/'];
var sprintf = require('tiny-sprintf');
var png = [], jpg = [], gif = [], svg = [];

images.forEach(function(item, index, arr){
  new imagemin()
  .src(item +'*.{git,jpg,png,svg}')
  .dest(item)
  .use(pngquant({quality:'85-100', speed: 0}))
  .use(jpegrecompress({quality:'veryheight', method:'smallfry', min:60, loop:3}))
  .use(imagemin.gifsicle({interlaced: true}))
  .use(imagemin.svgo())
  .run((err, files) => {
    fs.readdir(item, function(err, files){
      // console.log(files);
      for(var i=0; i<files.length; i++){
        var file = item + files[i];
        var fileopt = item + files[i];
        fs.stat(file, src_callbak(file, fileopt))
      }
    });
  });
});

function src_callbak(file, fileopt){
  if(path.basename(file) == 'sprite') return;
  return function(err, stat){
    switch(path.basename(file).split('.')[1]){
      case 'png':
        png.push(file);
        break;
      case 'jpg':
        jpg.push(file);
        break;
      case 'gif':
        gif.push(file);
        break;
      case 'svg':
        svg.push(file);
        break;
    }
    console.log(sprintf("%-20s\t%10s => %8s", path.basename(file), stat["size"], fs.statSync(fileopt)['size']));
  }
}

process.on('exit', (code) => {
  console.log(sprintf("%'=40s\n%s%5s\t %-5s\t%5s\t%5s", '', '總共壓縮：', png.length +' png', jpg.length +' jpg', gif.length +' gif', svg.length +' svg'));
});
