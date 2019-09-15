"use strict";

const server = require('./server/server.js');

const electron = require("electron");
let app = electron.app;
let BrowserWindow = electron.BrowserWindow;

app.on('ready', function () {
    let webserver = new server();
    webserver.eventEmitter.on('ready', (e) => {
        let win = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            }
        });
        win.setMenuBarVisibility(false)
        win.loadURL("http://localhost:8000");
    });
});
