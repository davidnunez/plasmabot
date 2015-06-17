var app = require('app')
var BrowserWindow = require('browser-window')
var three = require('three')

app.on('ready', function(){
	var mainWindow = new BrowserWindow({
		width:800,
		height:600
	})
	mainWindow.loadUrl('file://' + __dirname + '/index.html')
})