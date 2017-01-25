var log = require('./log');
var execPort = require('child_process').exec;

execPort('runIIS.wsf', function(error, stdout, stderr) { 
 	if(error){
 		console.log(error);
 	}
 	log.writePort();
});