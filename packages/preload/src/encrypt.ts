import type {Event} from 'electron';
const {ipcRenderer} = require('electron');
import type {IpcRendererEvent} from 'electron';

export const selectFile = (
  type: ('file' | 'dir')[],
  callback: (event: Event, path: {
    path: string,
    basename: string
  }) => void,
) => {
  ipcRenderer.invoke('selectFile', type);
  ipcRenderer.once('filePath', callback);
};

export const invokeEncrypt = (
  password: string,
  inputPath: string,
  callback: (event: IpcRendererEvent, message: string) => void,
  endCallback: (
    event: IpcRendererEvent,
    message: {
      code: number;
      info: string;
      outputPath?: string;
    },
  ) => void,
  options?: {
    outputDir?: string;
  },
) => {
  ipcRenderer.invoke('startEncrypt', {password, inputPath, options});
  ipcRenderer.on('encryptMsg', callback);
  ipcRenderer.once('encryptEnd', endCallback);
};
