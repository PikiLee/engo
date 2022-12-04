import {HMAC} from './encrypt';
import {HashAlgorithm} from './algorithms';
import {statSync, createReadStream} from 'node:fs';
// import {typeBufferEncoding}
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
  const [kdfAlgorithm, kdfIteration, kdfSalt, enAlgorithm, iv, enKeyLen, hashAlgorithm, hash, hashKeyLen, ext, _] =
    metadataStr.split('$');
  return {
    kdfAlgorithm,
    kdfIteration: Number(kdfIteration),
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
