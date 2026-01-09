const { app, BrowserWindow, globalShortcut, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let windows = [];
let focusedWindow = null;

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

  const win = new BrowserWindow(windowOptions);
  windows.push(win);

  win.loadFile('index.html');

  // Register global keyboard shortcuts when this window gains focus
  win.on('focus', () => {
    focusedWindow = win;

    // Unregister all first to avoid duplicates
    globalShortcut.unregisterAll();

    // Cmd+T: New tab in current window
    globalShortcut.register('CommandOrControl+T', () => {
      if (focusedWindow) {
        focusedWindow.webContents.send('shortcut', 'new-tab');
      }
    });

    // Cmd+N: New tab in current window (same as Cmd+T)
    globalShortcut.register('CommandOrControl+N', () => {
      if (focusedWindow) {
        focusedWindow.webContents.send('shortcut', 'new-tab');
      }
    });

    // Cmd+Shift+N: New window
    globalShortcut.register('CommandOrControl+Shift+N', () => {
      createWindow();
    });

    // Cmd+Shift+1~9: Open bookmark by index
    for (let i = 1; i <= 9; i++) {
      globalShortcut.register(`CommandOrControl+Shift+${i}`, () => {
        if (focusedWindow) {
          focusedWindow.webContents.send('shortcut', 'open-bookmark', i - 1);
        }
      });
    }

    // Cmd+W: Close tab
    globalShortcut.register('CommandOrControl+W', () => {
      if (focusedWindow) {
        focusedWindow.webContents.send('shortcut', 'close-tab');
      }
    });

    // Cmd+1~9: Switch tabs
    for (let i = 1; i <= 9; i++) {
      globalShortcut.register(`CommandOrControl+${i}`, () => {
        if (focusedWindow) {
          focusedWindow.webContents.send('shortcut', 'switch-tab', i - 1);
        }
      });
    }
  });

  // Unregister shortcuts when window loses focus
  win.on('blur', () => {
    globalShortcut.unregisterAll();
  });

  // Remove from array when closed
  win.on('closed', () => {
    windows = windows.filter(w => w !== win);
    if (focusedWindow === win) {
      focusedWindow = null;
    }
  });

  return win;
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
  const win = focusedWindow || windows[0] || null;
  const result = await dialog.showOpenDialog(win, {
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
