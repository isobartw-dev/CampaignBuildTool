var nodemon = require('nodemon');
var glob = require('glob');
var fs = require('fs');
var imageFolder = glob.sync('**/images/', {matchBase: true, ignore: ['node_modules/**', 'source-map/**']});
var imageFolderIgnore = ['*/sprite/'];

imageFolder.push('[desktop]');

nodemon({
  runOnChangeOnly: true,
  watch: imageFolder,
  ignore: imageFolderIgnore,
  ext: 'jpg png gif svg',
  script: 'task/imagefolder.js',
  watchOptions: {
    awaitWriteFinish: true
  }
});

nodemon
  .once('start', function () {
    console.log('watch:image 啟動');
  })
  .on('restart', function (files) {
    // console.log('[change] ' + getFile(files))
    fs.writeFileSync('task/.changelog', getFile(files));
  })
  .on('log', function (logs) {
    // console.log(logs.colour)
  });

function getFile (files) {
  if (files[0].indexOf(':') > -1) {
    return files[0];
  } else {
    files = files[0].slice(1);
    var dirname = process.cwd().slice(1) + '\\';
    return files.replace(dirname, '');
  }
}
