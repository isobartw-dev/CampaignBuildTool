var postcss = require('postcss');
var autoprefixer = require('autoprefixer');
var sprite = require('postcss-sprites').default;
var fs = require('fs');
var path = require('path');
var css_pc = fs.readFileSync('./css/style_edit.css');
var css_mobile = fs.readFileSync('./mobile/css/style_edit.css');
var opts_prefixer = {browser: ['last 1 versions', 'ie 8']};
var opts_sprite_pc = {
    stylesheetPath: './css',
    spritePath: './images/',
    basePath: './css',
    groupBy: function(image) {
      var groups = image.url.split('_')[1].toString().slice(0,-4);
      if (image.url.indexOf(groups) === -1) {
            return Promise.reject();
      }
      return Promise.resolve(groups);
    },
    filterBy: function(image){
      if(!/sprite/.test(image.url)){
        return Promise.reject();
      }
      return Promise.resolve();
    },
    hooks: {
      onUpdateRule: function(rule, token, image){
        var backgroundImage = postcss.decl({
            prop: 'background-image',
            value: 'url(' + image.spriteUrl + ')'
        });

        var backgroundPosition = postcss.decl({
            prop: 'background-position',
            value: image.coords.x + 'px ' + image.coords.x + 'px'
        });

        if(image.coords.x == 0 && image.coords.y == 0){
          rule.insertAfter(token, backgroundImage);
        }else{
          rule.insertAfter(token, backgroundImage);
          rule.insertAfter(backgroundImage, backgroundPosition);
        }
      },
      onSaveSpritesheet: function(opts, groups) {
          groups.push('png');
          return path.join(opts.spritePath, groups.join('.'));
      }
    }
};
var opts_sprite_mobile = {
    stylesheetPath: './mobile/css',
    spritePath: './mobile/images/',
    basePath: './mobile/css',
    groupBy: function(image) {
      var groups = image.url.split('_')[1].toString().slice(0,-4);
      if (image.url.indexOf(groups) === -1) {
            return Promise.reject();
      }
      return Promise.resolve(groups);
    },
    filterBy: function(image){
      if(!/sprite/.test(image.url)){
        return Promise.reject();
      }
      return Promise.resolve();
    },
    hooks: {
      onUpdateRule: function(rule, token, image) {
        var backgroundSizeX = (image.spriteWidth / image.coords.width) * 100;
        var backgroundSizeY = (image.spriteHeight / image.coords.height) * 100;
        var backgroundPositionX = (image.coords.x / (image.spriteWidth - image.coords.width)) * 100;
        var backgroundPositionY = (image.coords.y / (image.spriteHeight - image.coords.height)) * 100;

        backgroundSizeX = isNaN(backgroundSizeX) ? 0 : backgroundSizeX;
        backgroundSizeY = isNaN(backgroundSizeY) ? 0 : backgroundSizeY;
        backgroundPositionX = isNaN(backgroundPositionX) ? 0 : backgroundPositionX;
        backgroundPositionY = isNaN(backgroundPositionY) ? 0 : backgroundPositionY;

        var backgroundImage = postcss.decl({
            prop: 'background-image',
            value: 'url(' + image.spriteUrl + ')'
        });

        var backgroundSize = postcss.decl({
            prop: 'background-size',
            value: backgroundSizeX.toFixed(2) + '% ' + backgroundSizeY.toFixed(2) + '%'
        });

        var backgroundPosition = postcss.decl({
            prop: 'background-position',
            value: backgroundPositionX.toFixed(2) + '% ' + backgroundPositionY.toFixed(2) + '%'
        });

        if(image.spriteUrl.indexOf('@') > -1){
          rule.insertAfter(token, backgroundImage);
        }else if(backgroundPositionX == 0 && backgroundPositionY == 0){
          rule.insertAfter(token, backgroundImage);
          rule.insertAfter(backgroundImage, backgroundSize);
        }else{
          rule.insertAfter(token, backgroundImage);
          rule.insertAfter(backgroundImage, backgroundPosition);
          rule.insertAfter(backgroundPosition, backgroundSize);
        };
      },
      onSaveSpritesheet: function(opts, groups) {
        groups.push('png');
        return path.join(opts.spritePath, groups.join('.'));
      }
    }
};
var Processor_pc = postcss([sprite(opts_sprite_pc), autoprefixer(opts_prefixer)]);
var Processor_mobile = postcss([sprite(opts_sprite_mobile), autoprefixer(opts_prefixer)]);

// pc
Processor_pc
.process(css_pc, {from: './css/style_edit.css', to: './css/style.css'})
.then(function (result) {
    fs.writeFileSync('./css/style.css', result.css);
});
// mobile
Processor_mobile
.process(css_mobile, {from: './mobile/css/style_edit.css', to: './mobile/css/style.css'})
.then(function (result) {
    fs.writeFileSync('./mobile/css/style.css', result.css);
});

process.on('exit', function() {
  console.log('< process complete! restarting due to changes... >');
});
