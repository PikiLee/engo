import {Compressor} from './compressor';
import {HashAlgorithm, EnAlgorithm} from './algorithms';
const pump = require('pump');
const dayjs = require('dayjs');
import {randomBytes, scryptSync} from 'node:crypto';
import {Buffer} from 'node:buffer';

import {createCipheriv} from 'node:crypto';
import {join} from 'path';
import {createHmac} from 'node:crypto';
import {tmpdir} from 'node:os';
const _ = require('lodash');
import type {CurriedFunction1, CurriedFunction2} from 'lodash';
import {Path} from './path';
const fs = require('node:fs');
const crypto = require('node:crypto');

interface ScryptOptions {
  salt?: Buffer | null;
  saltLen?: number;
  iteration?: number;
  keyLen?: number;
  blockSize?: number;
  parallelism?: number;
}
interface DefaultScryptOptions {
  salt: Buffer | null;
  saltLen: number;
  iteration: number;
  keyLen: number;
  blockSize: number;
  parallelism: number;
}

interface EncryptOptions {
  algorithm?: EnAlgorithm;
  iv?: Buffer | null;
  start?: number;
  end?: number;
}

interface DefaultEncryptOptions {
  algorithm: EnAlgorithm;
  iv: Buffer | null;
  start: number;
  end: number;
}

interface FilenameOptions {
  addTime?: boolean;
  ext?: boolean;
}

interface HMACOptions {
  algorithm?: HashAlgorithm;
  start?: number;
  end?: number;
}

interface DefaultHMACOptions {
  algorithm: HashAlgorithm;
  start: number;
  end: number;
}

export class BaseCrypto {
  protected scrpytOptions: DefaultScryptOptions = {
    salt: null,
    saltLen: 16,
    iteration: 1048576,
    keyLen: 64,
    blockSize: 8,
    parallelism: 1,
  };

  protected encryptOptions: DefaultEncryptOptions = {
    algorithm: EnAlgorithm['aes-256-ctr'],
    iv: null,
    start: 0,
    end: Infinity,
  };

  protected hmacOptions: DefaultHMACOptions = {
    algorithm: HashAlgorithm['sha512'],
    start: 0,
    end: Infinity,
  };

  kdfKey: Buffer | null = null;
  enKey: Buffer | null = null;
  hashKey: Buffer | null = null;
  hash: string | null = null;
  metadataStr = '';

  temp: Path | null = null;

  constructor(
    protected password: string,
    protected curriedSend: CurriedFunction2<string, string, void>,
    scryptOptions?: ScryptOptions,
    encryptOptions?: EncryptOptions,
    hamcOptions?: HMACOptions,
  ) {
    this.scrpytOptions = _.defaults(scryptOptions, this.scrpytOptions);
    this.encryptOptions = _.defaults(encryptOptions, this.encryptOptions);
    this.hmacOptions = _.defaults(hamcOptions, this.hmacOptions);
  }

  /**
   * Generate a key with pbkdf2
   */
  generateKeyWithScrypt() {
    const {
      salt: passInSalt,
      saltLen,
      iteration,
      keyLen,
      blockSize,
      parallelism,
    } = this.scrpytOptions;

    if (!this.password) throw '请输入密码';

    const salt = passInSalt ?? randomBytes(saltLen);
    this.kdfKey = scryptSync(this.password.normalize(), salt, keyLen, {
      cost: iteration,
      blockSize,
      parallelization: parallelism,
      maxmem: 2 * 1024 * 1024 * 1024,
    });
    this.scrpytOptions.salt = salt;
    return this;
  }

  /**
   * Split one key into multiple keys.
   */
  splitKey(originalKey: Buffer, lens: number[]) {
    const lensCopy = [...lens];
    const length = originalKey.length;
    const sum = lens.reduce((pv, cv) => pv + cv);
    if (sum > length || length === 0 || lens.length === 0) throw 'Please pass in correct lens.';
    if (sum < length) lensCopy.push(length - sum);

    const resultKeys: Buffer[] = [];
    let index = 0;
    lensCopy.forEach(len => {
      resultKeys.push(originalKey.subarray(index, index + len));
      index += len;
    });

    return resultKeys;
  }

  /**
   * get encryption and hash key
   */
  getEnKeyandHashKey() {
    this.generateKeyWithScrypt();
    if (!this.kdfKey) throw 'kdf密钥不存在';
    const [enKey, hashKey] = this.splitKey(this.kdfKey, [32, 32]);
    this.enKey = enKey;
    this.hashKey = hashKey;
    return this;
  }

  /**
   * Generate HMAC
   * Not used, not working properly.
   * @param {string} filePath
   */
  HMAC(filePath: string) {
    if (!this.hashKey) throw 'hash密钥不存在';
    const hmac = createHmac(HashAlgorithm[this.hmacOptions.algorithm], this.hashKey);
    const input = fs.createReadStream(filePath, {
      start: this.hmacOptions.start,
      end: this.hmacOptions.end,
    });

    return new Promise<typeof this>((resolve, reject) => {
      input.on('error', (err: string) => {
        reject(err);
      });

      input.on('end', () => {
        this.hash = hmac.digest('hex');
        resolve(this);
      });

      input.pipe(hmac);
    });
  }
}

export class Encrypter extends BaseCrypto {
  input: Path;
  originalFileExt = '';
  output: Path;
  filenameOptions = {
    addTime: true,
    ext: '.nmsl',
  };

  sendInfo: CurriedFunction1<string, void>;
  sendError: CurriedFunction1<string, void>;
  sendEnd: CurriedFunction1<string, void>;
  /**
   * constructor
   * @param {string} password
   * @param {string} inputPath - A file or directory.
   * @param {string} outputPath - the output dirctory, default the director which the input is in.
   * @param {Object} filenameOptions - options related to the filename of the output file.
   * @param {boolean} filenameOptions.addTime - Whether or not add current time in the filename, default true.
   * @param {string} filenameOptions.ext - Specified the extension of output file, default .nmsl
   */
  constructor(
    password: string,
    inputPath: string,
    curriedSend: CurriedFunction2<string, string, void>,
    outputPath?: string,
    filenameOptions?: FilenameOptions,
    scryptOptions?: ScryptOptions,
    encryptOptions?: EncryptOptions,
  ) {
    super(password, curriedSend, scryptOptions, encryptOptions);
    this.input = new Path(inputPath);
    this.originalFileExt = this.input.extname();
    if (outputPath) {
      this.output = new Path(outputPath);
    } else {
      this.output = new Path(this.input.dirname());
    }
    this.normalizeOutputPath();
    this.filenameOptions = _.assign(filenameOptions, this.filenameOptions);

    // send
    this.sendInfo = this.curriedSend('encryptMsg');
    this.sendError = this.curriedSend('encryptError');
    this.sendEnd = this.curriedSend('encryptEnd');
  }

  /**
   * Add filename to the output path.
   */
  protected normalizeOutputPath() {
    if (!this.output.isDirectory()) throw '加密文件的输出路径必须为目录';
    if (this.filenameOptions.addTime) {
      this.output.join(
        dayjs().format('YYYY-MM-DDTHH-mm-ss') + '__' + this.input.name() + this.filenameOptions.ext,
      );
    } else {
      this.output.join(this.input.name() + this.filenameOptions.ext);
    }
  }

  /**
   * Encrypt a file.
   */
  async encrypt() {
    if (!this.encryptOptions.iv) this.encryptOptions.iv = randomBytes(16);

    if (!this.temp) throw '错误，找不到中转文件';
    const readable = fs.createReadStream(this.temp.getPath());
    const writeable = fs.createWriteStream(this.output.getPath());

    return new Promise<typeof this>((resolve, reject) => {
      if (!this.enKey) throw '加密密钥不存在';
      if (!this.encryptOptions.iv) throw '加密iv不存在';
      if (this.encryptOptions.algorithm === undefined) throw '请输入加密算法';
      const cipher = createCipheriv(
        EnAlgorithm[this.encryptOptions.algorithm],
        this.enKey,
        this.encryptOptions.iv,
      );
      pump(readable, cipher, writeable, (err: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  /**
   * Create metadata essential for decryption.
   */
  genMetadata(version = 0) {
    if (!this.enKey || !this.hashKey) throw '加密、hash密钥不存在';
    const data = [
      this.scrpytOptions.iteration,
      this.scrpytOptions.blockSize,
      this.scrpytOptions.parallelism,
      this.scrpytOptions.salt,
      this.encryptOptions.algorithm,
      this.encryptOptions.iv,
      this.enKey.length,
      this.hmacOptions.algorithm,
      this.hash,
      this.hashKey.length,
      this.originalFileExt,
    ];
    let str = '';
    data.forEach((d, index) => {
      if (d === null) throw 'meta不存在';
      if (index !== 0) {
        str += '$';
      }
      if (typeof d === 'number') {
        str += d.toString();
        return;
      }
      if (typeof d === 'string') {
        str += d;
        return;
      }
      str += d.toString('hex');
    });

    str += `$${version.toString()}`;

    const length = str.length + 9;
    str += `$${length.toString().padStart(8, '0')}`;
    this.metadataStr = str;
    return this;
  }

  /**
   * Write metadata to the output file.
   */
  async writeMetadataToFile() {
    await this.genMetadata();
    fs.appendFileSync(this.output.getPath(), this.metadataStr, {
      encoding: 'utf8',
    });
    return this;
  }

  /**
   * Start Encrypt File or Directory
   */
  async start() {
    try {
      this.sendInfo('一些准备活动');

      // compress
      this.temp = new Path(fs.mkdtempSync(join(tmpdir(), 'engo-')));
      this.temp.join(crypto.randomUUID());

      this.temp.setPath(
        await Compressor.compress(this.input.getPath(), {
          outputPath: this.temp.getPath(),
        }),
      );

      this.getEnKeyandHashKey();
      this.sendInfo('加密中');
      await this.encrypt();
      this.hash = '0';
      // this.sendInfo('计算哈希值');
      // await this.HMAC(this.output.getPath());
      this.writeMetadataToFile();

      this.temp.delete();
      this.temp.parent().delete();
      this.sendEnd(this.output.getPath());

      return this;
    } catch (err) {
      this.sendError(JSON.stringify(err));
      return this;
    }
  }
}

// interface DecryptFilenameOptions:

export class Decrypter extends BaseCrypto {
  input: Path;
  output: Path;
  originalFileExt = '';

  sendInfo: CurriedFunction1<string, void>;
  sendError: CurriedFunction1<string, void>;
  sendEnd: CurriedFunction1<string, void>;
  constructor(
    password: string,
    inputPath: string,
    curriedSend: CurriedFunction2<string, string, void>,
    outputPath?: string,
  ) {
    super(password, curriedSend);
    this.input = new Path(inputPath);
    if (outputPath) {
      this.output = new Path(outputPath);
    } else {
      this.output = new Path(this.input.dirname());
    }
    if (!this.output.isDirectory()) throw '输出路径必须为目录';

    // send
    this.sendInfo = this.curriedSend('decryptMsg');
    this.sendError = this.curriedSend('decryptError');
    this.sendEnd = this.curriedSend('decryptEnd');
  }
  /**
   * retrieve string from the end of encrypted file.
   */
  readFileFromBack = (
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

    const size = fs.statSync(filePath).size;
    const readable = fs.createReadStream(filePath, {
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
  retrieveMetaData = async () => {
    const length = Number(Number(await this.readFileFromBack(this.input.getPath())));
    const metadataStr = await this.readFileFromBack(this.input.getPath(), {
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
    ] = metadataStr.split('$');
    this.scrpytOptions = _.defaults(
      {
        salt: Buffer.from(kdfSalt, 'hex'),
        iteration: Number(kdfIteration),
        keyLen: Number(enKeyLen) + Number(hashKeyLen),
        blockSize: Number(kdfBlockSize),
        parallelism: Number(kdfParallelism),
      },
      this.scrpytOptions,
    );

    this.encryptOptions = _.defaults(
      {
        algorimthm: Number(enAlgorithm),
        iv: Buffer.from(iv, 'hex'),
        start: 0,
        end: this.input.stat().size - length,
      },
      this.encryptOptions,
    );

    this.hash = hash;
    this.hmacOptions = _.defaults({
      algorithm: Number(hashAlgorithm),
      start: 0,
      end: this.input.stat().size - length,
    });

    this.originalFileExt = ext;
    this.metadataStr = metadataStr;
    return this;
  };

  /**
   * Authenticate the data.
   */
  async authVerify() {
    const originalHash = this.hash;
    const {hash} = await this.HMAC(this.input.getPath());

    if (hash && hash === originalHash) {
      return true;
    } else {
      return false;
    }
  }

  decrypt() {
    this.temp = new Path(fs.mkdtempSync(join(tmpdir(), 'engo-')));
    this.temp.join(this.input.name()).addExtname('.tar');

    const decipher = crypto.createDecipheriv(
      EnAlgorithm[this.encryptOptions.algorithm],
      this.enKey,
      this.encryptOptions.iv,
    );

    const readable = fs.createReadStream(this.input.getPath(), {
      start: this.encryptOptions.start,
      end: this.encryptOptions.end,
    });

    const writable = fs.createWriteStream(this.temp.getPath());

    return new Promise((resolve, reject) => {
      pump(readable, decipher, writable, (err: string) => {
        if (err) reject(err);
        resolve(this);
      });
    });
  }

  /**
   * Start decrypt a file.
   */
  async start() {
    try {
      this.sendInfo('一些准备活动');
      await this.retrieveMetaData();
      // generate key from password
      this.generateKeyWithScrypt().getEnKeyandHashKey();

      // verify mac code
      // this.sendInfo('验证文件完整性中');
      // if (!(await this.authVerify())) throw '文件完整性验证失败';
      // decrypt
      this.sendInfo('解密中');
      await this.decrypt();

      if (!this.temp) throw '中继压缩文件不存在';
      await Compressor.uncompress(this.temp.getPath(), {outputPath: this.output.getPath()});
      this.output
        .join(this.input.name().replace(/\d\d\d\d-\d\d-\d\dT\d\d-\d\d-\d\d__/, ''))
        .addExtname(this.originalFileExt);

      this.temp.parent().delete();
      this.sendEnd(this.output.getPath());
      return this;
    } catch (err) {
      this.sendError(JSON.stringify(err));
    }
  }
}
