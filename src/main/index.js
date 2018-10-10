'use strict'
import {app, BrowserWindow} from 'electron'
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production'
//-----------
// Set `__static` path to static files in production
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
//---------
// rest of application code below
//--------------------
const {ipcMain} = require('electron');
var fs = require("fs");
//----------------
var APP_NAME = app.getName();
var USER_DATA_PATH = app.getPath('userData');
var APP_SETTINGS_FILE = 'app.json';
var config;
var configReady = false;
//------------------
// Global reference to mainWindow
// Necessary to prevent win from being garbage collected
let mainWindow
function createMainWindow() {
    config = {
        APP_NAME: APP_NAME, APP_SETTINGS_FILE: APP_SETTINGS_FILE, USER_DATA_PATH: USER_DATA_PATH, LISTEN_PORT: 5623
    }
    // Construct new BrowserWindow
    const window = new BrowserWindow({
        width: 470,
        height: 394,
        'min-width': 320,
        'min-height': 250,
        "web-preferences": {"web-security": false},
        "node-integration": "iframe"
    });
    // Set url for `win`
    // points to `webpack-dev-server` in development
    // points to `index.html` in production
    const url = isDevelopment
        ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
        : `file://${__dirname}/index.html`
    if (isDevelopment) {
        window.webContents.openDevTools({mode: 'undocked'})
    }
    window.loadURL(url)
    window.on('closed', () => {
        mainWindow = null
    })
    window.webContents.on('devtools-opened', () => {
        window.focus()
        setImmediate(() => {
            window.focus()
        })
    })
    ipcMain.on('controls-created', function (event, arg) {
        setupUserData();
    });
    ipcMain.on('error', function (event, err, msg) {
        // settingsWindow.webContents.send('error', err, msg);
    });
    return window
}
// Quit application when all windows are closed
app.on('window-all-closed', () => {
    // On macOS it is common for applications to stay open
    // until the user explicitly quits
    // if (process.platform !== 'darwin')
    app.quit()
})
app.on('activate', () => {
    // On macOS it is common to re-create a window
    // even after all windows have been closed
    if (mainWindow === null) mainWindow = createMainWindow()
})
// Create main BrowserWindow when electron is ready
app.on('ready', () => {
    mainWindow = createMainWindow()
})
//------------------------------------------------
function ensureExists(path, mask, callBackFunction) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        callBackFunction = mask;
        // mask = 0777;
        mask = 0o777;
    }
    fs.mkdir(path, mask, function (error) {
        if (error) {
            if (error.code == 'EEXIST') callBackFunction({created: false}); // ignore the error if the folder already exists
            else callBackFunction({error: error}); // something else went wrong
        } else callBackFunction({created: true}); // successfully created folder
    });
}
function setupUserData() {
    //called after controls created, so settingsWindow exists
    //create userdata/settings folder
//--------------------------------------------------
    ensureExists(USER_DATA_PATH + '/config', 0o744, function (result) {
        if (result.error) {
            mainWindow.webContents.send('error', result.error, "Could not create config folder.");
        } else {
            if (result.created) {
                const pathToAsset = path.join(__static, '/foobar.txt')
                //copy the default images / settings files
                //
                var ncp = require('ncp').ncp;
                ncp.limit = 16;
                var destination = USER_DATA_PATH + '/config/';
                var source = path.join(__static, '/config/')
                ncp(source, destination, function (err) {
                    if (err) {
                        mainWindow.webContents.send('error', err, "Could not duplicate config files.");
                    } else {
                        //ok then, the images are ok,
                        configReady = true;
                        mainWindow.webContents.send('config-ready', config);
                    }
                });
            } else {
                //directory already created, assume settings files are there.
                configReady = true;
                mainWindow.webContents.send('config-ready', config);
            }
        }
    });
//-----------------------------------
}
