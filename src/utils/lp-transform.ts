// file: src/utils/lp-transform.ts

import { Transform } from "stream";

/**
 * Inspired by mafintosh's "length-prefixed-stream" but uses fixed length prefixes
 *
 * @license MIT
 *
 * Some parameters that control memory allocation
 *
 * @param  PREFIX_LENGTH The length of length prefix
 * @param  POOL_SIZE     The number of items in pool for prefixes
 */

const POOL_SIZE = 1024;
const PREFIX_LENGTH = 4;

export function createCodec() {
  return {
    encoder: new LPEncoder(),
    decoder: new LPDecoder(),
  };
}

/**
 * Helper encoder that uses shared (between instances of one process) buffer
 * to allocate headers.
 */

let pool = Buffer.allocUnsafe(POOL_SIZE * PREFIX_LENGTH);
let used = 0;

function encode_int(num: number) {
  if (used >= POOL_SIZE * PREFIX_LENGTH - PREFIX_LENGTH) {
    pool = Buffer.allocUnsafe(POOL_SIZE * PREFIX_LENGTH);
    used = 0;
  }
  const start = used;
  pool.writeInt32LE(num, used);
  used += PREFIX_LENGTH;
  return pool.slice(start, start + PREFIX_LENGTH);
}


/**
 * [_transform description]
 *
 * @param  data [description]
 * @param  enc  [description]
 * @param  cb   [description]
 * @return      [description]
 */

export class LPEncoder extends Transform {
  private _destroyed: boolean = false;

  public _transform(data, enc, cb) {
    if (!this._destroyed) {
      this.push(encode_int(data.length));
      this.push(data);
    }
    cb();
  }

  public destroy(err) {
    if (this._destroyed) return
    this._destroyed = true;

    if (err) this.emit("error", err);
    else this.emit("close");
  }
}

/**
 * [_transform description]
 *
 * @param  data [description]
 * @param  enc  [description]
 * @param  cb   [description]
 * @return      [description]
 */

export class LPDecoder extends Transform {

  private _ptr: number = 0;
  private _readableState: any;
  private _transformState: any;
  private _prefix: Buffer = Buffer.allocUnsafe(PREFIX_LENGTH);
  private _message: any = null;
  private _missing: number = 0;
  private _destroyed: boolean = false;

  constructor(opts: any = {}) {
    super();
  }

  public destroy(err?) {
    if (this._destroyed) return;
    this._destroyed = true;
    if (err) this.emit("error", err);
    this.emit("close");
  }

  public _transform(data, enc, cb) {
    let offset = 0;

    while (!this._destroyed && offset < data.length) {
      if (this._missing) {
        offset = this._parseMessage(data, offset);
      } else {
        offset = this._parseLength(data, offset);
      }
    }

    cb();
  }

  private _parseLength(data, offset) {

    if (this._ptr === 0 && data.length - offset >= PREFIX_LENGTH) {
      this._missing = data.readInt32LE(offset);
      return offset + PREFIX_LENGTH;
    }

    while (this._ptr < PREFIX_LENGTH && offset < data.length) {
      this._prefix[this._ptr++] = data[offset++];
    }

    if (this._ptr === PREFIX_LENGTH) {
      this._missing = this._prefix.readInt32LE(0);
      this._ptr = 0;
    }

    return offset;
  }

  private _parseMessage(data, start) {
    const free = data.length - start;
    const missing = this._missing;
    const end = start + missing;

    if (!this._ptr && missing <= free) { // fast track - no copy
      this.push(data.slice(start, end));
      this._missing = 0;
      return end;
    }

    if (!this._ptr) {
      this._message = Buffer.allocUnsafe(missing);
    }

    data.copy(this._message, this._ptr, start, end);

    if (missing > free) {
      this._missing -= free;
      this._ptr += free;
      return data.length;
    }

    this.push(this._message);
    this._message = null;
    this._ptr = 0;
    this._missing = 0;
    return end;
  }

}

export const lpstream = {
  encode: LPEncoder,
  decode: LPDecoder,
  Encoder: LPEncoder,
  Decoder: LPDecoder
}
