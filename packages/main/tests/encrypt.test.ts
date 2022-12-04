import {HashAlgorithm, EnAlgorithm} from './../src/algorithms';
import {generateKey, splitKey, createMetadata, startEncrypt} from './../src/encrypt';
import {expect, test, describe} from 'vitest';
import {compress} from '../src/encrypt';
import {Buffer} from 'node:buffer';
import {unlinkSync, accessSync} from 'node:fs';
import {join, basename} from 'node:path';
import {encrypt} from '../src/encrypt';
import {HMAC} from './../src/encrypt';

const password = 'goodjobpeople';
const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\encrypt\\toBeEnctypted.txt';
const inputDir = 'C:\\Users\\root\\Desktop\\test\\engo-test\\encrypt\\dir-test-1';
const outputDir = 'C:\\Users\\root\\Desktop\\test\\engo-test\\encrypt';
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
    const [{key: enKey}, {key: hashKey}] = splitKey(kdfKey, [32, 32]);
    expect(enKey.length).toBe(32);
    expect(hashKey.length).toBe(32);
  });

  test('Throws with splitKey', () => {
    const buf = Buffer.alloc(77);
    expect(() => splitKey(buf, [55, 100])).toThrowError('pass in');
  });

  // test('test writing key to file', async () => {
  //   const key = Buffer.alloc(8, 'abcdefg');
  //   const outputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\zip-result.tgz';
  //   await writeKey(outputPath, key);
  //   const fileKey = await readKey(outputPath);
  //   expect(Buffer.compare(key, fileKey)).toBe(0);
  //   await fs.unlink(outputPath);
  // });
});

describe('test compress function', () => {
  test('compress file', async () => {
    const expectedOutput = join(outputDir, 'toBeEnctypted.txt.tgz');

    expect(await compress(inputPath, {outputDir: outputDir})).toBe(expectedOutput);
    accessSync(expectedOutput);
    unlinkSync(expectedOutput);
  });

  test('compress directory', async () => {
    const expectedOutput = join(outputDir, basename(inputDir) + '.tgz');
    expect(await compress(inputDir, {outputDir})).toBe(expectedOutput);
    accessSync(expectedOutput);
    unlinkSync(expectedOutput);
  });
});

describe('test encrypt file', () => {
  const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\toBeEnctypted.txt';
  const outputDir = 'C:\\Users\\root\\Desktop\\test\\engo-test';
  const {kdfKey} = generateKey(password);
  const [{key: enKey}] = splitKey(kdfKey, [32, 32]);

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

describe('test HMAC', () => {
  test('test generate HMAC', async () => {
    const hashKey = Buffer.alloc(64, 'a');
    expect((await HMAC(hashKey, inputPath)).hash.length).toBe(128);
  });
});

describe('test create metadata', () => {
  const kdfAlgorithm = HashAlgorithm['sha512'];
  const kdfIteration = 100000;
  const kdfSalt = Buffer.alloc(16);
  const enAlgorithm = EnAlgorithm['aes-256-ctr'];
  const iv = Buffer.alloc(16);
  const enKeyLen = 32;
  const hashAlgorithm = HashAlgorithm['sha512'];
  const hash = '123123123';
  const hashKeyLen = 32;
  const ext = '.zip';
  test('create metadata', () => {
    const metadata = createMetadata([
      kdfAlgorithm,
      kdfIteration,
      kdfSalt,
      enAlgorithm,
      iv,
      enKeyLen,
      hashAlgorithm,
      hash,
      hashKeyLen,
      ext,
    ]);
    const length = metadata.length;
    expect(Number(metadata.substring(length - 8))).toBe(length);
  });
});

describe('test startEncrypt function', () => {
  test('test startEncrypt function', async () => {
    const outputPath = await startEncrypt(
      password,
      inputPath,
      message => {
        console.log(message);
      },
      {
        outputDir,
      },
    );
    expect(accessSync(outputPath)).toBe(undefined);
    unlinkSync(outputPath);
  });
});
