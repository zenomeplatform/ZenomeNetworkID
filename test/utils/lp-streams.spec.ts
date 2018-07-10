// file: test/utils/lp-streams.spec.ts

import through = require("through2");
import concat = require("concat-stream");
import from = require("from2");

import { createCodec } from "../../src/utils/lp-transform";
import { assert } from "chai";

function chunk_hard() {
  return through(function(data, enc, cb) {
    while (data.length) {
      this.push(data.slice(0, 1));
      data = data.slice(1);
    }
    cb();
  });
}

function chunk() {
  return through(function(data, enc, cb) {
    while (data.length) {
      const size = 1 + ((Math.random() * data.length) | 0);
      const part = data.slice(0, size);
      this.push(part);
      data = data.slice(part.length);
    }
    cb();
  });
}

describe("LP-transform", function() {
  describe("basic", function() {
    it("encode -> decode", function(done) {
      const { encoder, decoder } = createCodec();

      decoder.on("data", function(data) {
        assert.equal(data.toString(), "hello world");
        done();
      });

      encoder.write("hello world");
      encoder.pipe(decoder);
    });

    it("encode -> decode twice", function() {
      // t.plan(2)

      const { encoder, decoder } = createCodec();

      const expects = ["hello world", "hola mundo"];

      decoder.on("data", function(data) {
        assert.equal(data.toString(), expects.shift());
      });

      encoder.write("hello world");
      encoder.write("hola mundo");
      encoder.pipe(decoder);
    });

    it("encode -> decode storm", function() {
      // t.plan(50)

      const { encoder, decoder } = createCodec();
      const expects = [];

      for (let i = 0; i < 50; i++) {
        expects.push(Buffer.allocUnsafe(50));
      }

      decoder.on("data", function(data) {
        const _data = expects.shift() as Buffer;
        assert(_data.equals(data as Buffer));
      });

      expects.forEach(function(b) {
        encoder.write(b);
      });

      encoder.pipe(decoder);
    });
  });

  describe("buffered", function() {
    it("buffered encode -> buffered decode", function(done) {
      const { encoder, decoder } = createCodec();

      decoder.on("data", function(data) {
        assert.equal(data.toString(), "hello world");
        done();
      });

      encoder.write("hello world");
      encoder.end();

      encoder.pipe(
        concat(function(data) {
          decoder.end(data);
        })
      );
    });
  });

  describe("chunked", function() {
    it("encode -> decode", function(done) {
      const { encoder, decoder } = createCodec();

      decoder.on("data", function(data) {
        assert.equal(data.toString(), "hello world");
        done();
      });

      encoder.write("hello world");
      encoder.pipe(chunk()).pipe(decoder);
    });

    it("encode -> decode twice", function() {
      // t.plan(2)

      const { encoder, decoder } = createCodec();

      const expects = ["hello world", "hola mundo"];

      decoder.on("data", function(data) {
        assert.equal(data.toString(), expects.shift());
      });

      encoder.write("hello world");
      encoder.write("hola mundo");
      encoder.pipe(chunk()).pipe(decoder);
    });

    it("encode -> decode storm", function() {
      // t.plan(50)

      const { encoder, decoder } = createCodec();
      const expects: Buffer[] = [];

      for (let i = 0; i < 50; i++) {
        expects.push(Buffer.allocUnsafe(50));
      }

      decoder.on("data", function(data) {
        const _data = expects.shift() as Buffer;
        assert(_data.equals(data as Buffer));
      });

      expects.forEach(function(b) {
        encoder.write(b);
      });

      encoder.pipe(chunk()).pipe(decoder);
    });
  });

  describe("heavy chunked", function() {
    it("encode -> decode", function(done) {
      const { encoder, decoder } = createCodec();

      decoder.on("data", function(data) {
        assert.equal(data.toString(), "hello world");
        done();
      });

      encoder.write("hello world");
      encoder.pipe(chunk_hard()).pipe(decoder);
    });

    it("encode -> decode twice", function() {
      // t.plan(2)

      const { encoder, decoder } = createCodec();

      const expects = ["hello world", "hola mundo"];

      decoder.on("data", function(data) {
        assert.equal(data.toString(), expects.shift());
      });

      encoder.write("hello world");
      encoder.write("hola mundo");
      encoder.pipe(chunk_hard()).pipe(decoder);
    });

    it("encode -> decode storm", function() {
      // t.plan(50)

      const { encoder, decoder } = createCodec();
      const expects = [];

      for (let i = 0; i < 50; i++) {
        expects.push(Buffer.allocUnsafe(50));
      }

      decoder.on("data", function(data) {
        const _data = expects.shift() as Buffer;
        assert(_data.equals(data as Buffer));
      });

      expects.forEach(function(b) {
        encoder.write(b);
      });

      encoder.pipe(chunk_hard()).pipe(decoder);
    });
  });

  describe("others", function() {
    it("multibyte varints", function() {
      // t.plan(5)

      const { encoder, decoder } = createCodec();
      const expects = [];

      for (let i = 0; i < 5; i++) {
        expects.push(Buffer.allocUnsafe(64 * 1024));
      }

      decoder.on("data", function(data) {
        const _data = expects.shift() as Buffer;
        assert(_data.equals(data as Buffer));
      });

      expects.forEach(function(b) {
        encoder.write(b);
      });

      encoder.pipe(chunk_hard()).pipe(decoder);
    });

    it("overflow varint pool", function() {
      // t.plan(4000)

      let i = 0;
      const buf = Buffer.allocUnsafe(64 * 1024);
      const { encoder, decoder } = createCodec();

      decoder.on("data", function(data: Buffer) {
        assert(buf.equals(data));
      });

      from(function read(size, cb) {
        setImmediate(function() {
          if (i++ < 4000) return cb(null, buf);
          cb(null, null);
        });
      })
        .pipe(encoder)
        .pipe(decoder);
    });
  });
});
