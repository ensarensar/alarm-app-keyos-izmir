const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Store = require('electron-store');
const prompt = require('electron-prompt');

const store = new Store();

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');

  win.webContents.on('did-finish-load', async () => {
    let mahalAdi = store.get('mahalAdi');
    let mahalKodu = store.get('mahalKodu');

    if (!mahalAdi || !mahalKodu) {
      mahalAdi = await prompt({ title: 'Config', label: 'mahalAdi:' });
      mahalKodu = await prompt({ title: 'Config', label: 'mahalKodu:' });
      store.set({ mahalAdi, mahalKodu });
    }

    const endpoint = 'http://10.85.1.77:3000/grikod-calistir';

    axios.post(endpoint, {
      mahalAdi,
      mahalKodu
    })
    .then(() => {
      win.webContents.send('status', '✅ Alarm başarıyla gönderildi!');
    })
    .catch((err) => {
      win.webContents.send('status', `❌ Hata: ${err.message}`);
    });
  });
}

app.whenReady().then(createWindow);
