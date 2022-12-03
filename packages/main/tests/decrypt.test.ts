import {unlinkSync} from 'node:fs';
import {startEncrypt} from './../src/encrypt';
import {retrieveMetaData, readMetaDataFromFile} from './../src/decrypt';
import {describe, test, expect} from 'vitest';
const password = 'goodjobpeople';
const inputPath = 'C:\\Users\\root\\Desktop\\test\\engo-test\\toBeEnctypted.txt';
// const outputDir = 'C:\\Users\\root\\Desktop\\test\\engo-test';

describe('test retrieve metadat', () => {
  test('test retrieve metadata', async () => {
    const outputPath = await startEncrypt(password, inputPath, message => {
      console.log(message);
    });
    const data = await readMetaDataFromFile(outputPath);
    expect(data.length).toBe(282);
    const metadata = retrieveMetaData(data);
    expect(metadata.ext).toBe('.txt');
    unlinkSync(outputPath);
  });
});
