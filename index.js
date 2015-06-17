var app = require('app')
var BrowserWindow = require('browser-window')
var three = require('three')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

app.on('ready', function(){
	mainWindow = new BrowserWindow({
		width:800,
		height:600
	})
	mainWindow.loadUrl('file://' + __dirname + '/index.html')
})