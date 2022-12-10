import * as _ from 'lodash-es';
import {Path} from '../src/path';
const crypto = require('node:crypto');

export const createFile = () => {
  const testFile = new Path(testDir);
  testFile.join(crypto.randomUUID() + '.txt');
  // testFile.join('123.txt');
  testFile.mkFile();
  return testFile;
};

export const createDir = () => {
  const testFile = new Path(testDir);
  testFile.join(crypto.randomUUID());
  testFile.mkDir();
  return testFile;
};

export const createCurrySend = () => {
  return _.curry((channel: string, message: string) => {
    console.log(channel, message);
  });
};

export const testDir = 'C:\\Users\\root\\Desktop\\test\\engo-2';
export const outDir = 'C:\\Users\\root\\Desktop\\test\\engo-2\\out';
export const password = 'goodnewssss';
