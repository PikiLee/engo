import * as _ from 'lodash-es';
import {Path} from './path';
const tar = require('tar');

export class Compressor {
  /**
   * compress a file or a directory
   * @param {string} inputPath - the path of the input
   * @param {Object} options
   * @property {string} options.outputPath - optional
   * @return {Promise<string>} output compressed file path
   */
  static compress = (
    inputPath: string,
    options?: {
      outputPath?: string;
    },
  ) => {
    const input = new Path(inputPath);
    const opts = _.defaults(options, {
      outputPath: input.dirname(),
    });
    const {outputPath} = opts;

    const output = new Path(outputPath);
    if (output.doesExist() && output.isDirectory()) {
      output.join(input.basename() + '.tgz');
    } else {
      output.addExtname('.tgz');
    }
    if (!input.doesExist()) throw '要压缩的文件不存在';

    return tar
      .c(
        {
          file: output.getPath(),
          preservePaths: true,
          noDirRecurse: true,
        },
        [input.getPath()],
      )
      .then(() => {
        return output.getPath();
      });
  };

  /**
   * Uncompress a file.
   */
  static uncompress = async (
    inputPath: string,
    options?: {
      outputPath?: string;
    },
  ) => {
    const input = new Path(inputPath);
    const opts = _.defaults(options, {
      outputPath: input.dirname(),
    });
    const {outputPath} = opts;

    const output = new Path(outputPath);

    if (!input.doesExist()) throw '要解压的文件不存在';

    return tar.x({
      file: inputPath,
      preservePaths: true,
      cwd: outputPath,
    }).then(() => {
      return output.getPath();
    });
  };
}
