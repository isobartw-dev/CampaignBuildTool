var pngtojpg = require('png-jpg');
var fs = require('fs');
var path = require('path');
var output = 'D:\\Data\\My documents\\Desktop\\Output\\';
var pc_path = './images/';
var mobile_path = './mobile/images/';
function gofolder(files){
  var mobile_img = files.filter(function(file){
    return file.indexOf('mobile') > -1;
  });
  var pc_img = files.filter(function(file){
    return file.indexOf('mobile') === -1;
  });
  pc_img.forEach(function(item, index, array){
    if(/sprite/.test(item)){
      fs.renameSync(output + item, pc_path +'sprite/' + item);
    }else{
      fs.renameSync(output + item, pc_path + item);
    }
  });
  mobile_img.forEach(function(item, index, array){
    if(/sprite/.test(item)){
      fs.renameSync(output + item, mobile_path +'sprite/' + item.split('mobile-')[1]);
    }else{
      fs.renameSync(output + item, mobile_path + item.split('mobile-')[1]);
    }
  });
};

fs.readdir(output, (err, files) => {
  if(!/jpg/.test(files.toString())) {
    gofolder(files);
  }else{
    var jpg = files.filter(function(file){
      return file.indexOf('jpg') > -1;
    });
    var png = files.filter(function(file){
      return file.indexOf('jpg') === -1;
    });
    jpg.forEach(function(item, index, arr){
      pngtojpg({
          input: output + item,
          output: output + item.split('_jpg')[0] +'.jpg',
          options: {
              quality: 100
          }
      }, function() {
          png.push(item.split('_jpg')[0] +'.jpg');
          fs.unlinkSync(output + item);
          console.log(item.split('_jpg')[0] +'.jpg saved');
          // console.log(png);
          // console.log(index, array.length-1);
          if(index == arr.length-1){
            gofolder(png);
          };
      });
    });
  };
});
