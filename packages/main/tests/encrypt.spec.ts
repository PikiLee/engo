import {Decrypter} from './../src/encrypt';
import {BaseCrypto, Encrypter} from '../src/encrypt';
import {expect, test, describe} from 'vitest';
import * as utils from './utils';

describe('test generate key', () => {
  test('generate key', async () => {
    const baseCrypto = new BaseCrypto(utils.password, utils.createCurrySend());
    baseCrypto.generateKeyWithScrypt();
    expect(baseCrypto.kdfKey?.length).toBe(64);
  });
});

describe('test split key', () => {
  test('Split key into enctyption key and hash key.', () => {
    const baseCrypto = new BaseCrypto(utils.password, utils.createCurrySend());
    baseCrypto.generateKeyWithScrypt();
    baseCrypto.getEnKeyandHashKey();
    expect(baseCrypto.enKey?.length).toBe(32);
    expect(baseCrypto.hashKey?.length).toBe(32);
  });
});

describe.only('test encrypt file', () => {
  test('test enctyption function', async () => {
    const testFile = utils.createFile();
    const encrypter = new Encrypter(utils.password, testFile.getPath(), utils.createCurrySend());
    encrypter.getEnKeyandHashKey();
    encrypter.temp = testFile;
    await encrypter.encrypt();
    expect(encrypter.output.doesExist()).toBe(true);
    encrypter.output.delete();
    testFile.delete();
  });
});

describe('test HMAC', () => {
  test('test generate HMAC', async () => {
    const testFile = utils.createFile();
    const encrypter = new Encrypter(utils.password, testFile.getPath(), utils.createCurrySend());
    encrypter.getEnKeyandHashKey();
    await encrypter.HMAC(testFile.getPath());
    expect(encrypter.hash?.length).toBe(128);
    testFile.delete();
  });
});

describe.only('test create metadata', () => {
  test('create metadata', async () => {
    const testFile = utils.createFile();
    const encrypter = new Encrypter(utils.password, testFile.getPath(), utils.createCurrySend());
    encrypter.getEnKeyandHashKey();
    encrypter.temp = testFile;
    await encrypter.encrypt();
    await encrypter.HMAC(encrypter.output.getPath());
    encrypter.genMetadata();
    const length = encrypter.metadataStr.length;
    expect(length).toBeGreaterThan(1);

    testFile.delete();
    encrypter.output.delete();
  });
});

describe('test startEncrypt function', () => {
  test('test startEncrypt function', async () => {
    const testFile = utils.createFile();

    const encrypter = new Encrypter(utils.password, testFile.getPath(), utils.createCurrySend());
    await encrypter.start();
    expect(encrypter.output.doesExist()).toBe(true);

    testFile.delete();
    encrypter.output.delete();
  });
});

describe('test retrieve metadata', () => {
  test('test retrieve metadata', async () => {
    const testFile = utils.createFile();

    const encrypter = new Encrypter(utils.password, testFile.getPath(), utils.createCurrySend());
    await encrypter.start();

    const decrypter = new Decrypter(
      utils.password,
      encrypter.output.getPath(),
      utils.createCurrySend(),
    );
    await decrypter.retrieveMetaData();
    expect(encrypter.metadataStr === decrypter.metadataStr).toBe(true);

    testFile.delete();
  });
});

describe('test verify hash funtion', () => {
  test('test verify hash function', async () => {
    const testFile = utils.createFile();

    const encrypter = new Encrypter(utils.password, testFile.getPath(), utils.createCurrySend());
    await encrypter.start();

    const decrypter = new Decrypter(
      utils.password,
      encrypter.output.getPath(),
      utils.createCurrySend(),
    );

    await decrypter.retrieveMetaData();
    decrypter.generateKeyWithScrypt().getEnKeyandHashKey();
    expect(await decrypter.authVerify()).toBe(true);

    testFile.delete();
  }, 20000);
});

describe('test decrypt function', () => {
  test('test decrypt', async () => {
    const testFile = utils.createFile();

    const encrypter = new Encrypter(utils.password, testFile.getPath(), utils.createCurrySend());
    await encrypter.start();

    const decrypter = new Decrypter(
      utils.password,
      encrypter.output.getPath(),
      utils.createCurrySend(),
    );

    await decrypter.retrieveMetaData();
    decrypter.generateKeyWithScrypt().getEnKeyandHashKey();
    await decrypter.decrypt();
    expect(decrypter.temp?.doesExist()).toBe(true);
    decrypter.temp?.delete();
    decrypter.temp?.parent().delete();

    testFile.delete();
  }, 20000);
});

describe('test startDecrypt function', () => {
  test('test startDecrypt.', async () => {
    const testFile = utils.createFile();

    const encrypter = new Encrypter(utils.password, testFile.getPath(), utils.createCurrySend());
    await encrypter.start();
    testFile.delete();

    const decrypter = new Decrypter(
      utils.password,
      encrypter.output.getPath(),
      utils.createCurrySend(),
    );

    await decrypter.start();
    expect(decrypter.output.doesExist()).toBe(true);

    decrypter.output.delete();
  }, 20000);
});
