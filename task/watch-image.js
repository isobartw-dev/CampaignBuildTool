var nodemon = require('nodemon');
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var imageFolder = glob.sync('**/images/', { matchBase: true, ignore: ['node_modules/**', 'source-map/**'] });
var imageFolderIgnore = ['*/sprite/'];

imageFolder.push('E:\\Snow.Huang\\My documents\\Desktop\\Output\\*.png')

nodemon({
    runOnChangeOnly: true,
    watch: imageFolder,
    ignore: imageFolderIgnore,
    ext: 'jpg png gif svg',
    script: 'task/imagefolder.js',
    watchOptions: {
        awaitWriteFinish: true
    }
})

nodemon.once('start', function() {
    console.log('watch:image 啟動');
}).on('restart', function(files) {
    // console.log('[change] ' + getFile(files))
    fs.writeFileSync('task/.changelog', getFile(files))
}).on('log', function(logs) {
    // console.log(logs.colour)
})

function getFile(files) {
    files = files[0].slice(1);
    var dirname = process.cwd().slice(1) + '\\';
    return files.replace(dirname, '');
}