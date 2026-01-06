const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    // PARA Integration APIs
    selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
    readProjects: (paraRoot) => ipcRenderer.invoke('fs:readProjects', paraRoot),
    saveMarkdown: (filePath, content) => ipcRenderer.invoke('fs:saveMarkdown', { filePath, content })
});
