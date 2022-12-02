import {generateKey, splitKey} from './../src/encrypt';
import {expect, test, describe} from 'vitest';
import {compress} from '../src/encrypt';
// import fs from 'node:fs/promises';
import {Buffer} from 'node:buffer';
// const {existsSync} = require('node:fs');
import {unlinkSync, accessSync} from 'node:fs';
import {join} from 'node:path';
import {encrypt} from '../src/encrypt';

const password = 'goodjobpeople';
describe('test generate key', () => {
  test('generate key', () => {
    const {kdfSalt, kdfKey} = generateKey(password);
    expect(kdfSalt.length).toBe(16);
    expect(kdfKey.length).toBe(64);
  });
});

describe('test split key', () => {
  test('Split key into enctyption key and hash key.', () => {
    const {kdfKey} = generateKey(password);
    const {enKey, hashKey} = splitKey(kdfKey);
    expect(enKey.length).toBe(32);
    expect(hashKey.length).toBe(32);
  });

  test('Throws with splitKey', () => {
    const buf = Buffer.alloc(77);
    expect(() => splitKey(buf)).toThrowError('even');
  });

  // test('test writing key to file', async () => {
  //   const key = Buffer.alloc(8, 'abcdefg');
  //   const outputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\zip-result.tgz';
  //   await writeKey(outputPath, key);
  //   const fileKey = await readKey(outputPath);
  //   expect(Buffer.compare(key, fileKey)).toBe(0);
  //   await fs.unlink(outputPath);
  // });

  // test('test startEncrypt function', async () => {
  //   const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\toBeEnctypted.txt';
  //   const outputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test';

  //   expect(await startEncrypt(inputPath, outputPath)).toBe(true);
  //   await fs.unlink('./key');
  // });
});

describe('test compress function', () => {
  test('compress file', async () => {
    const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\toBeEnctypted.txt';
    const outputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test';

    const expectedOutput = join(outputPath, 'toBeEnctypted.txt.zip');
    expect(await compress(inputPath, {outputDir: outputPath})).toBe(expectedOutput);
    accessSync(expectedOutput);
    unlinkSync(expectedOutput);
  });

  test('compress directory', async () => {
    const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\dir';
    const outputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test';

    const expectedOutput = join(outputPath, 'dir.zip');
    expect(await compress(inputPath, {outputDir: outputPath})).toBe(expectedOutput);
    accessSync(expectedOutput);
    unlinkSync(expectedOutput);
  });
});

describe('test encrypt file', () => {
  const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\toBeEnctypted.txt';
  const outputDir = 'C:\\Users\\root\\Desktop\\test\\engo-test';
  const {kdfKey} = generateKey(password);
  const {enKey} = splitKey(kdfKey);

  test('test enctyption function', async () => {
    const res = await encrypt(enKey, inputPath, {
      outputDir: outputDir,
    });
    expect(accessSync(res.outputPath)).toBe(undefined);
    unlinkSync(res.outputPath);
  });

  test('test not add time in the filename of the output', async () => {
    const res2 = await encrypt(enKey, inputPath, {
      outputDir: outputDir,
      addTime: false,
    });
    const expectedOutputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\toBeEnctypted.nmsl';
    expect(res2.outputPath).toBe(expectedOutputPath);
    unlinkSync(expectedOutputPath);
  });
});
