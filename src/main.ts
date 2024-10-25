import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

import started from "electron-squirrel-startup";
import { ArtnetActor, ArtnetSenderMachine } from './machine/artnetSender.machine';
import { createActor } from 'xstate';
import stringify from 'safe-stable-stringify';
import { NetworkInterface } from './types/network';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let artnetActor: ArtnetActor | null = null;
let mainWindow: BrowserWindow | null = null;

const startArtnet = () => {
  artnetActor?.stop();
  artnetActor = createActor(ArtnetSenderMachine, {
    input: {
      networkInterfacePollingIntervalInMs: 5000,
      artnetPollingIntervalInMs: 5000,
    },
    inspect: (inspectionEvent) => {
      if (inspectionEvent.type === "@xstate.snapshot") {
        const rawSnapshot = stringify(inspectionEvent.snapshot);
        mainWindow?.webContents.send("SNAPSHOT", rawSnapshot);
      } else if (inspectionEvent.type === "@xstate.event") {
        const rawEvent = stringify(inspectionEvent.event);
        mainWindow?.webContents.send("EVENT", rawEvent);
      }
    }
  });
  artnetActor.start();
};

const setInterface = (networkInterface: NetworkInterface) => {
  artnetActor?.send({
    type: 'NETWORK_INTERFACE_SET',
    networkInterface
  });
};


const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  ipcMain.on("START", () => startArtnet());
  ipcMain.on("SET_INTERFACE", (_, iFace: NetworkInterface) => setInterface(iFace));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  ipcMain.removeAllListeners("SET_INTERFACE");
  ipcMain.removeAllListeners("START");
});