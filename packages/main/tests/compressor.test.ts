import {Compressor} from '../src/compressor';
import {describe, test, expect} from 'vitest';
import {Path} from '../src/path';
import * as utils from './utils';

describe('test compress', () => {
  test('compress file and uncompress file', async () => {
    const testFile = utils.createFile();

    const expectedOutput = new Path(await Compressor.compress(testFile.getPath()));

    expect(expectedOutput.extname()).toBe('.tar');
    expect(expectedOutput.doesExist()).toBe(true);

    testFile.delete();

    await Compressor.uncompress(expectedOutput.getPath());
    const uncompressed = testFile.copy();
    expect(uncompressed.doesExist()).toBe(true);
    uncompressed.delete();
    expectedOutput.delete();
  });

  test('compress file with specified output directory.', async () => {
    const testFile = utils.createFile();

    const expectedOutput = new Path(
      await Compressor.compress(testFile.getPath(), {
        outputPath: utils.outDir,
      }),
    );

    expect(expectedOutput.extname()).toBe('.tar');
    expect(expectedOutput.doesExist()).toBe(true);
    testFile.delete();
    expectedOutput.delete();
  });

  test('compress directory', async () => {
    const testDir = utils.createDir();

    const expectedOutput = new Path(await Compressor.compress(testDir.getPath()));

    expect(expectedOutput.doesExist()).toBe(true);

    testDir.delete();
    await Compressor.uncompress(expectedOutput.getPath());
    const uncompressed = testDir;
    expect(uncompressed.doesExist()).toBe(true);
    uncompressed.delete();
    expectedOutput.delete();
  });
});
