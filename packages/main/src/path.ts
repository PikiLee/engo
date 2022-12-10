const nodePath = require('node:path');
const fs = require('node:fs');

export class Path {
  protected path: string;
  constructor(path: string) {
    this.path = path;
  }

  isFile = () => {
    return fs.statSync(this.path).isFile();
  };

  isDirectory = () => {
    return fs.statSync(this.path).isDirectory();
  };

  doesExist = () => {
    try {
      fs.accessSync(this.path);
      return true;
    } catch {
      return false;
    }
  };

  mkDir() {
    fs.mkdirSync(this.path);
    return this;
  }

  mkFile() {
    if (this.doesExist()) throw '要创建的文件已存在';
    fs.writeFileSync(this.path, '');
    return this;
  }

  parent() {
    return new Path(this.dirname());
  }

  join(...args: string[]) {
    this.path = nodePath.join(this.path, ...args);
    return this;
  }

  dirname() {
    return nodePath.dirname(this.path);
  }

  extname() {
    return nodePath.extname(this.path);
  }

  basename() {
    return nodePath.basename(this.path);
  }

  name() {
    return nodePath.basename(this.path, this.extname());
  }

  changeExtname(ext: string) {
    if (!this.extname()) this.addExtname(ext);
    this.path = this.path.substring(0, this.path.lastIndexOf(this.extname())) + ext;

    return this;
  }

  addExtname(ext: string) {
    this.path += ext;
    return this;
  }

  copy() {
    return new Path(this.path);
  }

  delete() {
    fs.rmSync(this.path, {
      recursive: true,
    });
  }

  stat() {
    return fs.statSync(this.path);
  }
  getPath() {
    return this.path;
  }

  setPath(path: string) {
    this.path = path;
  }
}
