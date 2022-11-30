import type {Event} from 'electron';
const {ipcRenderer} = require('electron');
import type {IpcRendererEvent} from 'electron';

export const selectFile = (
  type: 'file' | 'dir',
  callback: (event: Event, type: string) => void,
) => {
  ipcRenderer.invoke('selectFile', type);
  ipcRenderer.once('filePath', callback);
};

export const invokeEncrypt = (
  inputPath: string,
  outputDir: string,
  callback: (event: IpcRendererEvent, message: string) => void,
) => {
  ipcRenderer.invoke('startEncrypt', {inputPath, outputDir});
  ipcRenderer.once('encryptMsg', callback);
};
