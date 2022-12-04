import {unlinkSync, statSync} from 'node:fs';
import {startEncrypt, generateKey, splitKey} from './../src/encrypt';
import {retrieveMetaData, authVerify} from './../src/decrypt';
import {describe, test, expect} from 'vitest';
const password = 'goodjobpeople';
const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\toBeEnctypted.txt';
// const outputDir = 'C:\\Users\\root\\Desktop\\test\\engo-test';

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
    const outputPath = await startEncrypt(password, inputPath, message => {
      console.log(message);
    });

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
