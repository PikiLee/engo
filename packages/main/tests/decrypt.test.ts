import {unlinkSync} from 'node:fs';
import {startEncrypt} from './../src/encrypt';
import {retrieveMetaData} from './../src/decrypt';
import {describe, test, expect} from 'vitest';
const password = 'goodjobpeople';
const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\toBeEnctypted.txt';
// const outputDir = 'C:\\Users\\root\\Desktop\\test\\engo-test';

describe('test retrieve metadat', () => {
  test('test retrieve metadata', async () => {
    const outputPath = await startEncrypt(password, inputPath, message => {
      console.log(message);
    });
    const metadata = await retrieveMetaData(outputPath);
    expect(metadata.ext).toBe('.txt');
    unlinkSync(outputPath);
  });
});
