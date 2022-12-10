const _ = require('lodash');
import {Path} from '../src/path';
const crypto = require('node:crypto');

export const createFile = () => {
  const testFile = new Path(testDir);
  testFile.join(crypto.randomUUID() + '.txt');
  testFile.mkFile();
  return testFile;
};

export const createDir = () => {
  const dir = new Path(testDir);
  dir.join(crypto.randomUUID());
  dir.mkDir();
  const testFile = new Path(dir.getPath());
  testFile.join(crypto.randomUUID() + '.txt');
  testFile.mkFile();
  return dir;
};

export const createCurrySend = () => {
  return _.curry((channel: string, message: string) => {
    console.log(channel, message);
  });
};

export const testDir = 'C:\\Users\\root\\Desktop\\test\\engo-2';
export const outDir = 'C:\\Users\\root\\Desktop\\test\\engo-2\\out';
export const password = 'goodnewssss';
