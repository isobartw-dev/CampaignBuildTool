var Registry = require('winreg')
,   regKey = new Registry({                                       // new operator is optional 
      hive: Registry.HKCU,                                        // open registry hive HKEY_CURRENT_USER 
      key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders\\' // key containing autostart programs 
    })

// list autostart programs 
regKey.values(function (err, items /* array of RegistryItem */) {
  if (err)
    console.log('ERROR: '+err);
  else
    for (var i=0; i<items.length; i++)
    	if(items[i].name == 'Desktop'){
    		console.log(items[i].value);
    	}
});