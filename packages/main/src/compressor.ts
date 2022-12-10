const _ = require('lodash');
import {Path} from './path';
const tar = require('tar');

export class Compressor {
  /**
   * tar a file or a directory to .tar file, no compression happening now.
   * @param {string} inputPath - the path of the input, assumes a file or a directory
   * @param {Object} options
   * @property {string} options.outputPath - output path, assumes a directory that will contain the output file or a nonexistent file under whose name the output file will be created.
   * @return {Promise<string>} output file path
 **/
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
      output.join(input.basename() + '.tar');
    } else {
      output.addExtname('.tar');
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
   * untar a .tar file, no compression happening now.
   * @param {string} inputPath - the path of the input, assumes a .tar file
   * @param {Object} options
   * @property {string} options.outputPath - output path, assumes a directory that will contain the output file. 
   * @return {Promise<string>} output file or directory path
 **/
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
