import {HashAlgorithm, EnAlgorithm} from './algorithms';
const pump = require('pump');
const dayjs = require('dayjs');
import {randomBytes, pbkdf2Sync} from 'node:crypto';
import {Buffer} from 'node:buffer';
const archiver = require('archiver');
import {
  createWriteStream,
  createReadStream,
  appendFileSync,
  mkdtempSync,
  unlinkSync,
} from 'node:fs';
import {createCipheriv} from 'node:crypto';
import {join, basename, dirname, extname} from 'path';
import {createHmac} from 'node:crypto';
import {tmpdir} from 'node:os';
import {isFile, isDirectory, doesExist} from './utils';

/**
 * Generate a key with pbkdf2
 * @param {string} password
 * @param {Object} options
 * @property {number} options.saltLen - optional, default 16 bytes
 * @property {number} options.iteration - optional, default 100000 bytes
 * @property {number} options.keyLen - optional, default 64 bytes
 * @property {HashAlgorithm} options.algorithm - optional, default sha512
 * @return {Object}
 * @property {Buffer} return.kdfKey
 * @property {Buffer} return.kdfSalt
 * @property {Buffer} return.kdfIteration
 * @property {Buffer} return.kdfAlgorithm
 */
export const generateKey = (
  password: string,
  options?: {
    saltLen?: number;
    iteration?: number;
    keyLen?: number;
    algorithm?: HashAlgorithm;
  },
) => {
  const opts = Object.assign(
    {
      saltLen: 16,
      iteration: 100000,
      keyLen: 64,
      algorithm: HashAlgorithm['sha512'],
    },
    options,
  );
  const {saltLen, iteration, keyLen, algorithm} = opts;

  const salt = randomBytes(saltLen);
  const key = pbkdf2Sync(password, salt, iteration, keyLen, HashAlgorithm[algorithm]);
  return {
    kdfSalt: salt,
    kdfKey: key,
    kdfIteration: iteration,
    kdfAlgorithm: algorithm,
  };
};

/**
 * Split one key into two keys with equal length.
 */
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
 * @return {Promise<string>} output compressed file path
 */
export const compress = (
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

  if (!doesExist(inputPath)) throw '输入文件不存在';
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

/**
 * Encrypt a file.
 * @param {Buffer} key - Encryption Key
 * @param {string} inputPath
 * @param {Object} options
 * @property {EnAlgorithm} options.algorithm
 * @property {string} options.outputDir
 * @property {string} options.outputFilename
 * @property {boolean} options.addTime - whether or not add current time in the name of output file, default true
 * @property {boolean} options.outputExt - the extension of output file, default .nmsl
 */
export const encrypt = async (
  key: Buffer,
  inputPath: string,
  options?: {
    algorithm?: EnAlgorithm;
    outputDir?: string;
    outputFilename?: string;
    addTime?: boolean;
    outputExt?: string;
  },
) => {
  const inputDir = dirname(inputPath);
  const inputFileExt = extname(inputPath);
  const inputFilename = basename(inputPath, inputFileExt);
  const opts = Object.assign(
    {
      algorithm: EnAlgorithm['aes-256-ctr'],
      outputDir: inputDir,
      outputFilename: inputFilename,
      addTime: true,
      outputExt: '.nmsl',
    },
    options,
  );
  const {algorithm, outputDir, outputFilename, addTime, outputExt} = opts;

  const iv = randomBytes(16);

  const outputPath = addTime
    ? join(outputDir, dayjs().format('YYYY-MM-DDTHH-mm-ss') + '__' + outputFilename + outputExt)
    : join(outputDir, outputFilename + outputExt);

  const readable = createReadStream(inputPath);
  const writeable = createWriteStream(outputPath);

  return new Promise<{
    enKey: Buffer;
    algorithm: EnAlgorithm;
    iv: Buffer;
    outputPath: string;
    ext: string;
  }>((resolve, reject) => {
    const cipher = createCipheriv(EnAlgorithm[algorithm], key, iv);
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
 * @property {HashAlgorithm} options.algorithm
 * @return {Promise<Object>}
 * @property {string} return.hash
 * @property {string} return.algorithm
 */
export const HMAC = (
  hashKey: Buffer,
  filePath: string,
  options?: {
    algorithm?: HashAlgorithm;
  },
) => {
  const opts = Object.assign(
    {
      algorithm: HashAlgorithm['sha512'],
    },
    options,
  );

  const {algorithm} = opts;

  const hmac = createHmac(HashAlgorithm[algorithm], hashKey);
  const input = createReadStream(filePath);

  return new Promise<{
    hash: string;
    algorithm: HashAlgorithm;
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

export const writeMetadataToFile = (filePath: string, metadata: string) => {
  appendFileSync(filePath, metadata, {
    encoding: 'utf8',
  });
};

/**
 * Create metadata essential for decryption.
 */
export const createMetadata = (
  kdfAlgorithm: HashAlgorithm,
  kdfIteration: number,
  kdfSalt: Buffer,
  enAlgorithm: EnAlgorithm,
  iv: Buffer,
  hashAlgorithm: HashAlgorithm,
  hash: string,
  ext: string,
) => {
  let str = `${kdfAlgorithm}$${kdfIteration.toString().padEnd(8, '#')}$${kdfSalt
    .toString('hex')
    .padEnd(64, '#')}$${enAlgorithm}$${iv
    .toString('hex')
    .padEnd(64, '#')}$${hashAlgorithm}$${hash.padEnd(128, '#')}$${ext.padEnd(8, '#')}`;

  const length = str.length + 9;
  str += `$${length.toString().padEnd(8, '#')}`;
  return str;
};

/**
 * Start Encrypt File or Directory
 * @param {string} password
 * @param {string} inputPath
 * @param {Function} callback - callback to call at the end
 * @param {Object} options
 * @property {string} options.outputDir - specify the output directory, default the directory where the input file is in
 * @return {string} - error or output file path
 */
export const startEncrypt = async (
  password: string,
  inputPath: string,
  callback: (message: string) => void,
  options?: {
    outputDir?: string;
  },
) => {
  try {
    const isInputFile = isFile(inputPath);
    const inputDir = dirname(inputPath);
    const opts = Object.assign(
      {
        outputDir: inputDir,
      },
      options,
    );
    const {outputDir} = opts;
    if (!isDirectory(outputDir)) throw '输出路径必须为文件';

    if (!isInputFile) {
      // compress
      const tempDir = mkdtempSync(join(tmpdir(), 'engo-'));
      const tempFilename = 'temp-file';

      inputPath = await compress(inputPath, {
        outputDir: tempDir,
        outputFilename: tempFilename,
      });
    }

    const {kdfSalt, kdfIteration, kdfKey, kdfAlgorithm} = generateKey(password);
    const {enKey, hashKey} = splitKey(kdfKey);

    const {
      algorithm: enAlgorithm,
      iv,
      outputPath,
      ext,
    } = await encrypt(enKey, inputPath, {
      outputDir: outputDir,
    });
    const {hash, algorithm: hashAlgorithm} = await HMAC(hashKey, outputPath);
    const metadata = createMetadata(
      kdfAlgorithm,
      kdfIteration,
      kdfSalt,
      enAlgorithm,
      iv,
      hashAlgorithm,
      hash,
      ext,
    );
    writeMetadataToFile(outputPath, metadata);

    if (!isInputFile) {
      unlinkSync(inputPath);
    }
    callback('加密成功');

    return outputPath;
  } catch (err) {
    console.log(err);
    if (typeof err === 'string') {
      callback('error');
    }
    return 'error';
  }
};

// export const writeKey = async (outputPath: string, key: Buffer) => {
//   const outPath = path.normalize(outputPath);
//   await writeFile(outPath, key);
// };

// export const readKey = async (filePath: string) => {
//   const fPath = path.normalize(filePath);
//   const fileKey = await readFile(fPath);
//   return fileKey;
// };
