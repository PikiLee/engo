const fs = require('node:fs');
import {writeFile, readFile} from 'node:fs/promises';
const compressing = require('compressing');
const os = require('node:os');
const path = require('node:path');
const pump = require('pump');
const crypto = require('node:crypto');
const {keyObject} = require('node:crypto');
const dayjs = require('dayjs');

export const startEncrypt = async (
  input: string,
  output: string,
  callback: (message: string) => void,
) => {
  try {
    let inputPath = path.normalize(input);
    const outputDir = path.normalize(output);
    if (!fs.existsSync(inputPath) || !fs.existsSync(outputDir)) throw '文件或目录不存在';
    if (!isDirectory(outputDir)) throw '输出路径必须为文件';
    let outputPath = path.join(
      outputDir,
      dayjs().format('YYYY-MM-DDTHH-mm-ss') + '-' + path.basename(inputPath),
    );

    if (isDirectory(inputPath)) {
      // zip
      const tempDir = os.tmpdir();
      const tempFile = path.join(tempDir, Math.random() + '.tgz');
      inputPath = await zip(inputPath, tempFile);
      outputPath = outputPath + '.tgz';
    }

    outputPath += '.nmsl';

    const keyPath = './key';
    let key: Buffer;
    if (!fs.existsSync(keyPath)) {
      key = await generateKey();
      await writeKey(keyPath, key);
    } else {
      key = await readKey(keyPath);
    }

    await encrypt(key, inputPath, outputPath);
    callback('加密成功');

    return true;
  } catch (err) {
    console.log(err);
    if (typeof err === 'string') {
      callback(err);
    }
  }
};

export const zip = async (inputPath: string, outputPath: string): Promise<string> => {
  if (!isDirectory) throw '必需是目录';
  const tarStream = new compressing.tgz.Stream();
  tarStream.addEntry(inputPath);
  const destStream = fs.createWriteStream(outputPath);
  return new Promise((resovle, reject) =>
    pump(tarStream, destStream, (err: string) => {
      console.log(err);
      if (err) reject('error');
      resovle('succeed');
    }),
  );
};

export const encrypt = async (key: Buffer, inputpath: string, outputPath: string) => {
  if (!fs.existsSync(outputPath)) {
    fs.writeFileSync(outputPath, '');
  }

  const readable = fs.createReadStream(inputpath);
  const writeable = fs.createWriteStream(outputPath);

  const algorithm = 'AES-256-CBC';

  return new Promise((resolve, reject) => {
    crypto.randomFill(new Uint8Array(16), (err: string, iv: Buffer) => {
      if (err) reject(err);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      pump(readable, cipher, writeable, (err: string) => {
        if (err) {
          reject(err);
        } else {
          resolve('succeed');
        }
      });
    });
  });
};

export const generateKey = async (): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    crypto.generateKey('aes', {length: 256}, (err: string, key: typeof keyObject) => {
      if (err) {
        reject(err);
      } else {
        resolve(key.export());
      }
    });
  });
};

export const writeKey = async (outputPath: string, key: Buffer) => {
  const outPath = path.normalize(outputPath);
  await writeFile(outPath, key);
};

export const readKey = async (filePath: string) => {
  const fPath = path.normalize(filePath);
  const fileKey = await readFile(fPath);
  return fileKey;
};

export const isFile = (filePath: string) => {
  return fs.statSync(filePath).isFile();
};

export const isDirectory = (dirPath: string) => {
  return fs.statSync(dirPath).isDirectory();
};
