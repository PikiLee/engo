import type {Event} from 'electron';
const {ipcRenderer} = require('electron');

export const selectFile = (
  type: 'file' | 'dir',
  callback: (event: Event, type: string) => void,
) => {
  ipcRenderer.invoke('selectFile', type);
  ipcRenderer.once('filePath', callback);
};
