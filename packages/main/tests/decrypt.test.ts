import {unlinkSync, statSync, accessSync, rmSync} from 'node:fs';
import {startEncrypt, generateKey, splitKey, compress} from './../src/encrypt';
import {retrieveMetaData, authVerify, decrypt, uncompress} from './../src/decrypt';
import {describe, test, expect} from 'vitest';
const password = 'goodjobpeople';
const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\decrypt\\toBeEnctypted.txt';
const inputDir = 'C:\\Users\\root\\Desktop\\test\\engo-test\\decrypt\\dir';
// const zipFile = 'C:\\Users\\root\\Desktop\\test\\engo-test\\decrypt\\dir-test.zip';

describe('test retrieve metadata', () => {
  test('test retrieve metadata', async () => {
    const outputPath = await startEncrypt(password, inputPath, message => {
      console.log(message);
    });
    const metadata = await retrieveMetaData(outputPath);
    expect(metadata.ext).toBe('.txt');
    unlinkSync(outputPath);
  });
});

describe('test verify hash funtion', () => {
  test('test verify hash function', async () => {
    const outputPath = await startEncrypt(
      password,
      inputPath,
      message => {
        console.log(message);
      },
      {
        outputFilename: 'test-hash-1',
      },
    );

    const {hash, kdfSalt, kdfIteration, metadataLen} = await retrieveMetaData(outputPath);

    const {kdfKey} = generateKey(password, {
      salt: kdfSalt,
      iteration: kdfIteration,
    });
    const [_, {key: hashKey}] = splitKey(kdfKey, [32, 32]);
    const {size} = statSync(outputPath);
    expect(
      await authVerify(outputPath, hashKey, hash, {
        end: size - metadataLen - 1,
      }),
    ).toBe(true);
    unlinkSync(outputPath);
  });
});

describe('test decrypt function', () => {
  test('test decrypt', async () => {
    const outputPath = await startEncrypt(
      password,
      inputPath,
      message => {
        console.log(message);
      },
      {
        outputFilename: 'test-decrypt-1',
      },
    );

    const {kdfSalt, kdfIteration, enAlgorithm, iv, enKeyLen, ext, metadataLen} =
      await retrieveMetaData(outputPath);

    const {kdfKey} = generateKey(password, {
      salt: kdfSalt,
      iteration: kdfIteration,
    });
    const [{key: enKey}] = splitKey(kdfKey, [enKeyLen]);
    const {size} = statSync(outputPath);
    const decryptedPath = await decrypt(outputPath, enKey, iv, {
      algorithm: enAlgorithm,
      outputExt: ext,
      end: size - metadataLen - 1,
    });
    unlinkSync(outputPath);
    unlinkSync(decryptedPath);
  });
});

describe('test uncompress function', () => {
  test('test uncompress', async () => {
    const compressed = await compress(inputDir);
    const unzipped = await uncompress(compressed, {
      outputFilename: 'test-uncompress',
    });
    expect(accessSync(unzipped)).toBe(undefined);
    rmSync(unzipped, {
      recursive: true,
    });
    unlinkSync(compressed);
  });
});
