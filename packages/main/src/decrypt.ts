import {statSync, createReadStream} from 'node:fs';

/**
 * retrieve metadata string from encrypted file.
 */
export const readMetaDataFromFile = (
  filePath: string,
  options?: {
    len: number;
  },
) => {
  const {len} = Object.assign(
    {
      len: 282,
    },
    options,
  );

  const size = statSync(filePath).size;
  const readable = createReadStream(filePath, {
    start: size - len,
    encoding: 'utf8',
  });

  return new Promise<string>(resolve => {
    readable.on('readable', () => {
      let metadata = '';
      let data: string;
      while ((data = readable.read()) !== null) {
        metadata += data;
      }

      readable.destroy();

      resolve(metadata);
    });
  });
};

/**
 * Retrieve metadata from string.
 */
export const retrieveMetaData = (data: string) => {
  const [kdfAlgorithm, kdfIteration, kdfSalt, enAlgorithm, iv, hashAlgorithm, hash, ext] =
    data.split('$');
  return {
    kdfAlgorithm,
    kdfIteration: removeChar(kdfIteration),
    kdfSalt: Buffer.from(removeChar(kdfSalt), 'hex'),
    enAlgorithm: enAlgorithm,
    iv: Buffer.from(removeChar(iv), 'hex'),
    hashAlgorithm: hashAlgorithm,
    hash: removeChar(hash),
    ext: removeChar(ext),
  };
};

export const removeChar = (
  str: string,
  options?: {
    char?: string;
  },
) => {
  const {char} = Object.assign(
    {
      char: '#',
    },
    options,
  );
  return str.replaceAll(char, '');
};

