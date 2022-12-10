import type {SelectFilePropterties} from './../../main/src/mainWindow';
const {ipcRenderer} = require('electron');
import type {IpcRendererEvent} from 'electron';

export const selectFile = (
  resultCallback: (event: IpcRendererEvent, message: string) => void,
  properties?: SelectFilePropterties,
) => {
  ipcRenderer.invoke('dialog:selectFile', properties);
  ipcRenderer.once('result:dialog:selectFile', resultCallback);
};

export const invokeEncrypt = (type: 'en' |'de', password: string, inputPath: string, outputPath?: string) => {
  ipcRenderer.send('startEncrypt', type, password, inputPath, outputPath);
};

export const waitForEnMessage = (
  infoCallback: (event: IpcRendererEvent, message: string) => void,
  errorCallback: (event: IpcRendererEvent, message: string) => void,
  endCallback: (event: IpcRendererEvent, message: string) => void,
) => {
  ipcRenderer.on('encryptMsg', infoCallback);
  ipcRenderer.on('encryptError', errorCallback);
  ipcRenderer.on('encryptEnd', endCallback);
};

export const waitForDeMessage = (
  infoCallback: (event: IpcRendererEvent, message: string) => void,
  errorCallback: (event: IpcRendererEvent, message: string) => void,
  endCallback: (event: IpcRendererEvent, message: string) => void,
) => {
  ipcRenderer.on('decryptMsg', infoCallback);
  ipcRenderer.on('decryptError', errorCallback);
  ipcRenderer.on('decryptEnd', endCallback);
};
