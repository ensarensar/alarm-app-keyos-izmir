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
    let ip = store.get('ip');
    let port = store.get('port');
    let mahalAdi = store.get('mahalAdi');
    let mahalKodu = store.get('mahalKodu');

    if (!ip || !port || !mahalAdi || !mahalKodu) {
      ip = await prompt({ title: 'Config', label: 'IP Adresi:' });
      port = await prompt({ title: 'Config', label: 'Port:' });
      mahalAdi = await prompt({ title: 'Config', label: 'mahalAdi:' });
      mahalKodu = await prompt({ title: 'Config', label: 'mahalKodu:' });
      store.set({ ip, port, mahalAdi, mahalKodu });
    }

    axios.post(`http://${ip}:${port}/grikod-calistir`, {
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
