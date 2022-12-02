import {generateKey, splitKey} from './../src/encrypt';
import {expect, test, describe} from 'vitest';
import {compress} from '../src/encrypt';
// import fs from 'node:fs/promises';
import {Buffer} from 'node:buffer';
// const {existsSync} = require('node:fs');
import {unlinkSync} from 'node:fs';
import {join} from 'node:path';

describe('test encrypt', () => {
  const password = 'goodjobpeople';
  test('generate key', () => {
    const {kdfSalt, kdfKey} = generateKey(password);
    expect(kdfSalt.length).toBe(16);
    expect(kdfKey.length).toBe(64);
  });

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

  test('compress directory', async () => {
    const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\dir';
    const outputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test';

    expect(await compress(inputPath, outputPath)).toBe(join(outputPath, 'dir.zip'));
    unlinkSync(join(outputPath, 'dir.zip'));
  });

  test('compress file', async () => {
    const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\toBeEnctypted.txt';
    const outputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test';

    expect(await compress(inputPath, outputPath)).toBe(join(outputPath, 'toBeEnctypted.txt.zip'));
    unlinkSync(join(outputPath, 'toBeEnctypted.txt.zip'));
  });

  // test('test writing key to file', async () => {
  //   const key = Buffer.alloc(8, 'abcdefg');
  //   const outputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\zip-result.tgz';
  //   await writeKey(outputPath, key);
  //   const fileKey = await readKey(outputPath);
  //   expect(Buffer.compare(key, fileKey)).toBe(0);
  //   await fs.unlink(outputPath);
  // });

  // test('test enctyption function', async () => {
  //   const key = Buffer.alloc(32, 'abc');
  //   const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\toBeEnctypted.txt';
  //   const outputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\good-result.tgz';
  //   await encrypt(key, inputPath, outputPath);
  //   expect(existsSync(outputPath));
  //   await fs.unlink(outputPath);
  // });

  // test('test startEncrypt function', async () => {
  //   const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\toBeEnctypted.txt';
  //   const outputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test';

  //   expect(await startEncrypt(inputPath, outputPath)).toBe(true);
  //   await fs.unlink('./key');
  // });
});
