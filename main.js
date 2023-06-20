// Modules to control application life and create native browser window
const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron')
const path = require('path')


function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
let tray = null
app.whenReady().then(() => {
  tray = new Tray('./logo.png')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Lock Audio Devices', type: 'checkbox' },
    { label: 'Settings...', type: 'normal' },
    { label: 'Quit', type: 'normal' }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
})

const { exec } = require('child_process');
const csv=require('csvtojson')


ipcMain.on('multi-change-command', (event) => {
  const command = 'svcl.exe /SetDefault ' + event.returnValue;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error}`);
      event.sender.send('command-execution-result', { success: false, output: error });
      return;
    }
    console.log(stdout);


  })
})

ipcMain.on('run-command', (event) => {
  const command = 'svcl.exe /sjson ""';

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error}`);
      event.sender.send('command-execution-result', { success: false, output: error });
      return;
    }
  
    // Handle the output of the CLI command
    // let preParsed = stdout.replace('"":""', '')
    let preParsed = stdout.replace(/^\uFEFF/, '');

    try {
      let value = JSON.parse(preParsed)
      value = value
      event.sender.send('command-execution-result', { success: true, output: value });

    } catch (error) {
      console.log('error', error)
    }


    // Handle any error messages
    // console.error(stderr);
  });
});