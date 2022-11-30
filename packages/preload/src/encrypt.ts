import type {Event} from 'electron';
const {ipcRenderer} = require('electron');

export const selectFile = (
  type: 'file' | 'dir',
  callback: (event: Event, type: string) => void,
) => {
  ipcRenderer.invoke('selectFile', type);
  ipcRenderer.once('filePath', callback);
};

export const invokeEncrypt = (inputPath:string, outputDir: string) => {
  ipcRenderer.invoke('startEncrypt', {inputPath, outputDir});
};
