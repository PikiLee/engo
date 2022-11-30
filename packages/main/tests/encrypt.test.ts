import {generateKey, writeKey, readKey, encrypt, startEncrypt} from './../src/encrypt';
import {expect, test} from 'vitest';
import {zip} from '../src/encrypt';
import fs from 'node:fs/promises';
import {Buffer} from 'node:buffer';
const {existsSync} = require('node:fs');

test('zip function', async () => {
  const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\dir';
  const outputPath = 'C:\\Users\\root\\Desktop\\test\\zip-result.tgz';
  expect(await zip(inputPath, outputPath)).toBe('succeed');
  await fs.unlink(outputPath);
});

test('generate key', async () => {
  expect(await generateKey()).toBeTypeOf('object');
});

test('test writing key to file', async () => {
  const key = Buffer.alloc(8, 'abcdefg');
  const outputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\zip-result.tgz';
  await writeKey(outputPath, key);
  const fileKey = await readKey(outputPath);
  expect(Buffer.compare(key, fileKey)).toBe(0);
  await fs.unlink(outputPath);
});

test('test enctyption function', async () => {
  const key = Buffer.alloc(32, 'abc');
  const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\toBeEnctypted.txt';
  const outputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\good-result.tgz';
  await encrypt(key, inputPath, outputPath);
  expect(existsSync(outputPath));
  await fs.unlink(outputPath);
});

test('test startEncrypt function', async () => {
  const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\toBeEnctypted.txt';
  const outputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test';

  expect(await startEncrypt(inputPath, outputPath)).toBe(true);
});
