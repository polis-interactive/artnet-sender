import { contextBridge, ipcRenderer } from "electron";
import type { ArtnetSnapshot, ArtnetSnapshotCallback } from "../machine/artnetSender.machine";
import type { NetworkInterface } from "../types/network";


export const ArtnetSenderApi = {
  startActor: (snapshotCallback: ArtnetSnapshotCallback) => {
    ipcRenderer.removeAllListeners('SNAPSHOT');
    ipcRenderer.on('SNAPSHOT', (_, rawSnapshot: string) => {
      const snapshot = JSON.parse(rawSnapshot) as ArtnetSnapshot;
      snapshotCallback(snapshot);
    });
    ipcRenderer.send('START');
  },
  selectNetworkInterface: (iFace: NetworkInterface) => {
    ipcRenderer.send('SET_INTERFACE', iFace);
  }
}

process.once('loaded', () => {
  contextBridge.exposeInMainWorld('ArtnetSenderApi', ArtnetSenderApi)
});