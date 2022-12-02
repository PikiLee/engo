const fs = require('node:fs');
import {writeFile, readFile} from 'node:fs/promises';
// const os = require('node:os');
const path = require('node:path');
const pump = require('pump');
const crypto = require('node:crypto');
const dayjs = require('dayjs');
import {randomBytes, pbkdf2Sync} from 'node:crypto';
import {Buffer} from 'node:buffer';
const archiver = require('archiver');
import {createWriteStream, accessSync, createReadStream} from 'node:fs';
// import {fileURLToPath} from 'node:url';
import {join, basename, dirname, extname} from 'path';
import {createHmac} from 'node:crypto';

export const generateKey = (password: string) => {
  const salt = randomBytes(16);
  const key = pbkdf2Sync(password, salt, 1000, 64, 'sha512');
  return {
    kdfSalt: salt,
    kdfKey: key,
  };
};

export const splitKey = (originalKey: Buffer) => {
  const length = originalKey.length;
  if (length % 2 !== 0 || length === 0) throw 'Please pass in a key with even number of bytes.';
  const halfLength = length * 0.5;
  const enKey = Buffer.alloc(halfLength);
  const hashKey = Buffer.alloc(halfLength);
  originalKey.copy(enKey, 0, 0, halfLength - 1);
  originalKey.copy(hashKey, 0, 0, halfLength - 1);

  return {
    enKey,
    hashKey,
  };
};

/**
 * compress a file or a directory
 * @param {string} inputPath - the path of the input
 * @param {Object} options
 * @property {string} options.outputDir - optional
 * @property {string} options.outputFilename - optional
 *
 */
export const compress = async (
  inputPath: string,
  options?: {
    outputDir?: string;
    outputFilename?: string;
  },
) => {
  const filename = basename(inputPath);
  const inputDir = dirname(inputPath);
  const opts = Object.assign(
    {
      outputDir: inputDir,
      outputFilename: filename,
    },
    options,
  );
  const {outputDir, outputFilename} = opts;
  doesExist(inputPath);
  if (!isDirectory(outputDir)) throw '必须是目录';
  const outputFile = join(outputDir, outputFilename + '.zip');
  const output = createWriteStream(outputFile);
  const archive = archiver('zip', {
    zlib: {
      level: 9,
    },
  });

  const res = new Promise<string>((resolve, reject) => {
    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      resolve(outputFile);
    });
    archive.on('error', function (err: string) {
      reject(err);
    });
  });

  archive.pipe(output);
  if (isDirectory(inputPath)) {
    archive.directory(inputPath, false);
  } else {
    archive.file(inputPath, {name: outputFilename});
  }
  archive.finalize();

  return res;
};

// export const startEncrypt = async (
//   input: string,
//   output: string,
//   callback: (message: string) => void,
// ) => {
// try {
//   let inputPath = path.normalize(input);
//   const outputDir = path.normalize(output);
//   if (!fs.existsSync(inputPath) || !fs.existsSync(outputDir)) throw '文件或目录不存在';
//   if (!isDirectory(outputDir)) throw '输出路径必须为文件';
//   let outputPath = path.join(
//     outputDir,
//     dayjs().format('YYYY-MM-DDTHH-mm-ss') + '-' + path.basename(inputPath),
//   );

//   if (isDirectory(inputPath)) {
//     // zip
//     const tempDir = os.tmpdir();
//     const tempFile = path.join(tempDir, Math.random() + '.tgz');

//     await zip(inputPath, tempFile);
//     inputPath = tempFile;
//     outputPath = outputPath + '.tgz';
//   }

//   outputPath += '.nmsl';

//   const keyPath = './key';
//   let key: Buffer;
//   if (!fs.existsSync(keyPath)) {
//     key = await generateKey();
//     await writeKey(keyPath, key);
//   } else {
//     key = await readKey(keyPath);
//   }

//   await encrypt(key, inputPath, outputPath);
//   callback('加密成功');

//   return true;
// } catch (err) {
//   console.log(err);
//   if (typeof err === 'string') {
//     callback(err);
//   }
// }
// };

/**
 * Encrypt a file.
 * @param {Buffer} key - Encryption Key
 * @param {string} inputPath
 * @param {Object} options
 * @property {string} options.algorithm
 * @property {string} options.utputDir
 * @property {string} options.utputFilename
 * @property {boolean} options.addTime - whether or not add current time in the name of output file.
 */
export const encrypt = async (
  key: Buffer,
  inputPath: string,
  options?: {
    algorithm?: string;
    outputDir?: string;
    outputFilename?: string;
    addTime?: boolean;
  },
) => {
  const inputDir = dirname(inputPath);
  const inputFileExt = extname(inputPath);
  const inputFilename = basename(inputPath, inputFileExt);
  const opts = Object.assign(
    {
      algorithm: 'aes-256-ctr',
      outputDir: inputDir,
      outputFilename: inputFilename,
      addTime: true,
    },
    options,
  );
  const {algorithm, outputDir, outputFilename, addTime} = opts;

  const iv = randomBytes(16);

  const outputPath = addTime
    ? join(outputDir, dayjs().format('YYYY-MM-DDTHH-mm-ss') + '__' + outputFilename + '.nmsl')
    : join(outputDir, outputFilename + '.nmsl');

  const readable = fs.createReadStream(inputPath);
  const writeable = fs.createWriteStream(outputPath);

  return new Promise<{
    enKey: Buffer;
    algorithm: string;
    iv: Buffer;
    outputPath: string;
    ext: string;
  }>((resolve, reject) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    pump(readable, cipher, writeable, (err: string) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          enKey: key,
          algorithm,
          iv,
          outputPath,
          ext: inputFileExt,
        });
      }
    });
  });
};

/**
 * Generate HMAC
 * @param {Buffer} hashKey
 * @param {string} filePath
 * @param {Object} options
 * @property {string} options.algorithm
 */
export const HMAC = (
  hashKey: Buffer,
  filePath: string,
  options?: {
    algorithm?: string;
  },
) => {
  const opts = Object.assign(
    {
      algorithm: 'sha-512',
    },
    options,
  );

  const {algorithm} = opts;

  const hmac = createHmac(algorithm, hashKey);
  const input = createReadStream(filePath);

  return new Promise<{
    hash: string;
    algorithm: string;
  }>((resolve, reject) => {
    input.on('error', err => {
      console.log(err);
      reject(err);
    });

    input.on('end', () => {
      resolve({
        hash: hmac.digest('hex'),
        algorithm,
      });
    });

    input.pipe(hmac);
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

export const doesExist = (path: string) => {
  accessSync(path);
};
