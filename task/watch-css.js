var nodemon = require('nodemon');
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var cssFolder = glob.sync('**/css/', { matchBase: true, ignore: ['node_modules/**', 'source-map/**'] });
var cssFolderIgnore = ['style.css', 'style-edit.css',
    'style-source.css'
];

nodemon({
    runOnChangeOnly: true,
    watch: cssFolder,
    ignore: cssFolderIgnore,
    ext: 'css scss sass',
    script: 'task/csscompiled.js',
    watchOptions: {
        awaitWriteFinish: true
    }
})

nodemon.once('start', function() {
    fs.writeFileSync('task/.changelog', '');
    console.log('watch:css 啟動');
}).on('restart', function(files) {
    console.log('[change] ' + getFile(files))
    fs.writeFileSync('task/.changelog', getFile(files))
}).on('log', function(logs) {
    // console.log(logs.colour)
})

function getFile(files){
    files = files[0].slice(1);
    var dirname = process.cwd().slice(1) + '\\';
    return files.replace(dirname, '');
}