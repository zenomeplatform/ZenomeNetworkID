// file: src/utils/buffer-pool.ts

import Debug = require("debug");
const debug = Debug("BufferPool");

// debug.enabled = true;

/**
 * Helper that uses shared (between instances of one process) buffer
 * to allocate buffers.
 */

export class BufferPool {

  private currentSize: number = 0;
  private pool: Buffer;
  private used: number = 0;

  constructor(public size: number = 100 * 1024) {
    this.renewPool();
  }

  public renewPool() {
    this.pool = Buffer.alloc(this.size);
    this.currentSize = this.size;
    this.used = 0;
  }

  public get(length: number) {
    if (3 * length > this.size) {
      this.size = 10 * length;
    }
    if (length + this.used < this.currentSize) {
      const start = this.used;
      this.used += length;
      return this.pool.slice(start, start + length);
    } else {
      this.renewPool();
      this.used = length;
      return this.pool.slice(0, length);
    }
  }

}
