const {ipcRenderer} = require('electron');
export const showFile = (path: string) => {
  ipcRenderer.send('showFile', path);
};
