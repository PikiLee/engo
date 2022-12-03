import {accessSync, statSync} from 'node:fs';

export const isFile = (filePath: string) => {
  return statSync(filePath).isFile();
};

export const isDirectory = (dirPath: string) => {
  return statSync(dirPath).isDirectory();
};

export const doesExist = (path: string) => {
  try {
    accessSync(path);
    return true;
  } catch {
    return false;
  }
};
