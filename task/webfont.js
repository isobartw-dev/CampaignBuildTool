var glob = require("glob");
var fs = require('fs');
var path = require('path');
var execPort = require('child_process');
var cssFiles = glob.sync('**/style.css', { matchBase: true, ignore: 'node_modules/**' });
var subsetFiles = glob.sync('{**/*.html,**/*.aspx}', { matchBase: true, ignore: 'node_modules/**' });
var fontData;

function setEndSyntax(content, syntax) {
	return content.endsWith(syntax);
}

function setStartPosition(content, startText) {
	return content.indexOf(startText);
}

function getFontRelativePath(cssPath, fontPath) {
	return path.relative(path.dirname(cssPath), fontPath).replace(/\\/g, '/');
}

function setFontUrl(content, endSyntax, startText) {
	var endSyntax = setEndSyntax(endSyntax);
	var startPosition = setStartPosition(content, startText);
	return !endSyntax ? content.slice(startPosition) : content.slice(startPosition, -1);
}

function setInsetText(content, oldText, newText, setEndSyntax) {
	if (setEndSyntax) {
		return content.replace(oldText, newText.slice(0, -1));
	} else {
		return content.replace(oldText, newText);
	}
}

function subset(file) {
	fontData = [];
	execPort.execSync('glyphhanger ' + file + ' --css=string --formats=otf,woff,woff2 --subset=font/*.otf', { encoding: 'utf8' })
		.split('\n')
		.forEach(function(text, index, arr) {
			var fontDataText = JSON.stringify(fontData);
			if (text.match(/^\s*src/) && fontDataText.indexOf(text) == -1) {
				fontData.push({ sort: text.match(/[A-Za-z]+(?=\-subset)/)[0], value: text.replace(/\s{2,}/, '') })
			} else if (text.match(/U\+[A-Z0-9]+/) && fontDataText.indexOf('unicode') == -1) {
				fontData.push({ sort: 'unicode', value: 'unicode-range: ' + text });
			}
		});
}

cssFiles.forEach(function(cssFile, index) {
	var readCSS = fs.readFileSync(cssFile).toString().split(';');
	var device = /mobile/.test(cssFile);
	var sortSubsetFile = subsetFiles.filter(function(subsetFile, index, arr) {
		return /mobile/.test(subsetFile) == device;
	}).join(' ');

	subset(sortSubsetFile);

	readCSS.forEach(function(css, index) {
		var cssLine = index;
		if (css.indexOf('src') > -1) {
			fontData.forEach(function(font, index, arr) {
				if (index == 0) {
					return;
				} else if (css.indexOf(font.sort) > -1) {
					var replacePath = getFontRelativePath(cssFile, 'font');
					var getUrlText = setFontUrl(css, ';', 'src');
					var replaceFontText = setInsetText(font.value, /font/g, replacePath);
					var replaceUrlText = setInsetText(css, getUrlText, replaceFontText, true);
					var addUnicodeText = setInsetText(css, getUrlText, arr[0].value);

					readCSS.splice(cssLine, 1, replaceUrlText)
					if (readCSS[cssLine + 1].indexOf('unicode') > -1) {
						readCSS.splice((cssLine + 1), 1, addUnicodeText);
					} else {
						readCSS.splice((cssLine + 1), 0, addUnicodeText);
					}

				}
			});
		}
	});

	var writeCSS = readCSS.join(';');

	fs.writeFileSync(cssFile, writeCSS);
});

process.on('exit', (code) => {
	if(code != 0){
		console.log('有地方出錯! task已停止');
	}else{
		console.log('字型壓縮完成');
	}
});