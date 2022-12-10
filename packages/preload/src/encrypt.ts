import type {SelectFilePropterties} from './../../main/src/mainWindow';
const {ipcRenderer} = require('electron');
import type {IpcRendererEvent} from 'electron';

export const selectFile = (properties: SelectFilePropterties) => {
  ipcRenderer.invoke('dialog:selectFile', properties);
};

export const invokeEncrypt = (password: string, inputPath: string, outputPath?: string) => {
  ipcRenderer.send('startEncrypt', password, inputPath, outputPath);
};

export const waitForEnMessage = (
  infoCallback: (event: IpcRendererEvent, message: string) => void,
  errorCallback: (event: IpcRendererEvent, message: string) => void,
  endCallback: (event: IpcRendererEvent, message: string) => void,
) => {
  ipcRenderer.on('encryptMsg', infoCallback);
  ipcRenderer.on('encryptEroor', errorCallback);
  ipcRenderer.once('encryptEnd', endCallback);
};
