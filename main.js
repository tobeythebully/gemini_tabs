const { app, BrowserWindow, globalShortcut, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  const isMac = process.platform === 'darwin';

  const windowOptions = {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js')
    }
  };

  // macOS 전용 설정
  if (isMac) {
    windowOptions.titleBarStyle = 'hiddenInset';
    windowOptions.trafficLightPosition = { x: 15, y: 15 };
  } else {
    // Windows: 기본 프레임 사용, 메뉴바 숨김
    windowOptions.autoHideMenuBar = true;
  }

  mainWindow = new BrowserWindow(windowOptions);

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

// ============================================
// PARA IPC Handlers
// ============================================

// 폴더 선택 다이얼로그
ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'PARA 폴더 선택'
  });
  return result.canceled ? null : result.filePaths[0];
});

// Projects 폴더 스캔
ipcMain.handle('fs:readProjects', async (event, paraRoot) => {
  try {
    const projectsPath = path.join(paraRoot, 'Projects');
    if (!fs.existsSync(projectsPath)) {
      return { error: 'Projects 폴더가 없습니다.' };
    }
    const projects = fs.readdirSync(projectsPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    return { projects };
  } catch (err) {
    return { error: err.message };
  }
});

// 마크다운 파일 저장
ipcMain.handle('fs:saveMarkdown', async (event, { filePath, content }) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
});
