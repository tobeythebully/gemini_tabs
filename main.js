const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // Register keyboard shortcuts
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      document.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey) {
          if (e.key === 't') {
            e.preventDefault();
            window.tabManager.createTab();
          } else if (e.key === 'w') {
            e.preventDefault();
            window.tabManager.closeCurrentTab();
          } else if (e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            window.tabManager.switchToTab(parseInt(e.key) - 1);
          }
        }
      });
    `);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
