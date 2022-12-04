import {doesExist, isDirectory} from './utils';
import {HMAC, generateKey, splitKey} from './encrypt';
import {HashAlgorithm, EnAlgorithm} from './algorithms';
import {statSync, createReadStream, createWriteStream, mkdirSync, unlinkSync} from 'node:fs';
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
    start?: number;
    end?: number;
    outputPath?: string;
  },
) => {
  const inputDir = dirname(inputPath);
  const enExt = extname(inputPath);
  const inputFilename = basename(inputPath, enExt);
  const opts = Object.assign(
    {
      algorithm: EnAlgorithm['aes-256-ctr'],
      start: 0,
      end: Infinity,
      outputPath: join(inputDir, inputFilename),
    },
    options,
  );
  const {algorithm, start, end} = opts;
  let {outputPath} = opts;
  if (doesExist(outputPath) && isDirectory(outputPath)) {
    outputPath = join(outputPath, inputFilename);
  }

  const decipher = createDecipheriv(EnAlgorithm[algorithm], enKey, iv);

  const readable = createReadStream(inputPath, {
    start,
    end,
  });

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

/**
 * Start decrypt a file.
 */
export const startDecrypt = async (
  password: string,
  inputPath: string,
  options?: {
    outputPath: string;
  },
) => {
  const {
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
    metadataLen,
  } = await retrieveMetaData(inputPath);

  const inputDir = dirname(inputPath);
  const inputFilename = basename(inputPath, '.nmsl');
  let {outputPath} = Object.assign(
    {
      outputPath: join(inputDir, inputFilename + ext),
    },
    options,
  );
  if (doesExist(outputPath) && isDirectory(outputPath)) {
    outputPath = join(outputPath, inputFilename + ext);
  }

  // generate key from password
  const {kdfKey} = generateKey(password, {
    salt: kdfSalt,
    iteration: kdfIteration,
    blockSize: kdfBlockSize,
    parallelism: kdfParallelism,
    keyLen: enKeyLen + hashKeyLen,
  });
  const [{key: enKey}, {key: hashKey}] = splitKey(kdfKey, [enKeyLen, hashKeyLen]);

  // verify mac code
  const inputSize = statSync(inputPath).size;
  const end = inputSize - metadataLen - 1;
  if (
    !(await authVerify(inputPath, hashKey, hash, {
      algorithm: hashAlgorithm,
      end,
    }))
  ) {
    throw '文件完整性验证未通过';
  }

  // decrypt
  console.log(
    await decrypt(inputPath, enKey, iv, {
      algorithm: enAlgorithm,
      end,
      outputPath,
    }),
  );

  // uncompress
  const finalPath = ext === '.tgz' ? await uncompress(outputPath) : outputPath;

  if (ext === '.tgz') {
    unlinkSync(outputPath);
  }

  return finalPath;
};
