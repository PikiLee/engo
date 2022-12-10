// import { startEncrypt, Encrypter } from './encrypt';
import type {IpcMainEvent, IpcMainInvokeEvent} from 'electron';
import {app, BrowserWindow, ipcMain, shell} from 'electron';
import {join} from 'path';
import {URL} from 'url';
import {Encrypter} from './encrypt';
const {dialog} = require('electron');
const _ = require('lodash');

function handleEncrypt(
  event: IpcMainEvent,
  password: string,
  inputPath: string,
  outputPath?: string,
) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  if (!win) throw '找不到窗口';

  function send(channel: string, message: string) {
    if (!win) throw '找不到窗口';
    win.webContents.send(channel, message);
  }

  const curriedSend = _.curry(send);
  const encrypter = new Encrypter(password, inputPath, curriedSend, outputPath);
  encrypter.start();
}

export type SelectFilePropterties = Array<
  | 'openFile'
  | 'openDirectory'
  | 'multiSelections'
  | 'showHiddenFiles'
  | 'createDirectory'
  | 'promptToCreate'
  | 'noResolveAliases'
  | 'treatPackageAsDirectory'
  | 'dontAddToRecent'
>;

async function handleFileOpen(event: IpcMainInvokeEvent, properties: SelectFilePropterties) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  if (!win) throw '找不到窗口';
  const {canceled, filePaths} = await dialog.showOpenDialog(win, {properties});
  if (canceled) {
    return;
  } else {
    return filePaths[0];
  }
}

function handleShowFile(event: IpcMainEvent, path: string) {
  shell.showItemInFolder(path);
}

async function createWindow() {
  const browserWindow = new BrowserWindow({
    width: 400,
    height: 640,
    minWidth: 400,
    minHeight: 640,
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.cjs'),
    },
  });

  ipcMain.handle('dialog:selectFile', handleFileOpen);
  ipcMain.on('startEncrypt', handleEncrypt);
  ipcMain.on('showFile', handleShowFile);

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();

    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test.
   */
  const pageUrl =
    import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  await browserWindow.loadURL(pageUrl);

  return browserWindow;
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}
