import {doesExist} from './utils';
import {HMAC} from './encrypt';
import {HashAlgorithm, EnAlgorithm} from './algorithms';
import {statSync, createReadStream, createWriteStream, mkdirSync} from 'node:fs';
import {dirname, basename, extname, join} from 'node:path';
import {createDecipheriv} from 'node:crypto';
const pump = require('pump');
const {x} = require('tar');
/**
 * retrieve string from the end of encrypted file.
 */
export const readFileFromBack = (
  filePath: string,
  options?: {
    len?: number;
    encoding?: BufferEncoding;
  },
) => {
  const {len, encoding} = Object.assign(
    {
      len: 8,
      encoding: 'utf8',
    },
    options,
  );

  const size = statSync(filePath).size;
  const readable = createReadStream(filePath, {
    start: size - len,
    encoding: encoding,
  });

  return new Promise<string>(resolve => {
    readable.on('readable', () => {
      let data = '';
      let d: string;
      while ((d = readable.read()) !== null) {
        data += d;
      }

      readable.destroy();

      resolve(data);
    });
  });
};

/**
 * Retrieve metadata from file.
 */
export const retrieveMetaData = async (filePath: string) => {
  const length = Number(Number(await readFileFromBack(filePath)));
  const metadataStr = await readFileFromBack(filePath, {
    len: length,
  });
  const [
    kdfIteration,
    kdfBlockSize,
    kdfParallelism,
    kdfSalt,
    enAlgorithm,
    iv,
    enKeyLen,
    hashAlgorithm,
    hash,
    hashKeyLen,
    ext,
    _,
  ] = metadataStr.split('$');
  return {
    kdfIteration: Number(kdfIteration),
    kdfBlockSize: Number(kdfBlockSize),
    kdfParallelism: Number(kdfParallelism),
    kdfSalt: Buffer.from(kdfSalt, 'hex'),
    enAlgorithm: Number(enAlgorithm),
    iv: Buffer.from(iv, 'hex'),
    enKeyLen: Number(enKeyLen),
    hashAlgorithm: Number(hashAlgorithm),
    hash: hash,
    hashKeyLen: Number(hashKeyLen),
    ext: ext,
    metadataLen: length,
  };
};

/**
 * Authenticate the data.
 */
export const authVerify = async (
  filePath: string,
  hashKey: Buffer,
  originalHash: string,
  options?: {
    algorithm?: HashAlgorithm;
    start?: number;
    end?: number;
  },
) => {
  const {start, end, algorithm} = Object.assign(
    {
      algorithm: HashAlgorithm['sha512'],
      start: 0,
      end: Infinity,
    },
    options,
  );

  const {hash} = await HMAC(hashKey, filePath, {
    algorithm,
    start,
    end,
  });

  if (hash === originalHash) {
    return true;
  } else {
    return false;
  }
};

export const decrypt = (
  inputPath: string,
  enKey: Buffer,
  iv: Buffer,
  options?: {
    algorithm?: EnAlgorithm;
    outputDir?: string;
    outputFilename?: string;
    outputExt?: string;
    start?: number;
    end?: number;
  },
) => {
  const inputDir = dirname(inputPath);
  const enExt = extname(inputPath);
  const inputFilename = basename(inputPath, enExt);
  const {algorithm, outputDir, outputFilename, outputExt, start, end} = Object.assign(
    {
      algorithm: EnAlgorithm['aes-256-ctr'],
      outputDir: inputDir,
      outputFilename: inputFilename,
      start: 0,
      end: Infinity,
    },
    options,
  );

  const decipher = createDecipheriv(EnAlgorithm[algorithm], enKey, iv);

  const readable = createReadStream(inputPath, {
    start,
    end,
  });

  const outputPath = join(outputDir, `${outputFilename}${outputExt ?? ''}`);
  const writable = createWriteStream(outputPath);

  return new Promise<string>((resolve, reject) => {
    pump(readable, decipher, writable, (err: string) => {
      if (err) reject(err);
      resolve(outputPath);
    });
  });
};

/**
 * Uncompress a file.
 */
export const uncompress = async (
  inputPath: string,
  options?: {
    outputDir?: string;
    outputFilename?: string;
  },
) => {
  const filename = basename(inputPath, '.tgz');
  const inputDir = dirname(inputPath);
  const opts = Object.assign(
    {
      outputDir: inputDir,
      outputFilename: filename,
    },
    options,
  );
  const {outputDir, outputFilename} = opts;

  const outputPath = join(outputDir, outputFilename);
  if (!doesExist(outputPath)) mkdirSync(outputPath);
  return x({
    file: inputPath,
    cwd: outputPath,
  }).then(() => {
    return outputPath;
  });
};
