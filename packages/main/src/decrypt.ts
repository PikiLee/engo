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
  const length = Number(removeChar(await readFileFromBack(filePath)));
  const metadataStr = await readFileFromBack(filePath, {
    len: length,
  });
  const [
    kdfAlgorithm,
    kdfIteration,
    kdfSalt,
    enAlgorithm,
    iv,
    hashAlgorithm,
    hash,
    ext,
    _,
  ] = metadataStr.split('$');
  return {
    kdfAlgorithm,
    kdfIteration: removeChar(kdfIteration),
    kdfSalt: Buffer.from(removeChar(kdfSalt), 'hex'),
    enAlgorithm: enAlgorithm,
    iv: Buffer.from(removeChar(iv), 'hex'),
    hashAlgorithm: hashAlgorithm,
    hash: removeChar(hash),
    ext: removeChar(ext),
    metadataLen: length,
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

// export const authVerify = (filePath: string) => {};
