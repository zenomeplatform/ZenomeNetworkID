// benchmarks/utils/stream-lp.test.ts

import { createCodec } from "../../src/utils/lp-transform";
import from = require("from2");
const prettyBytes = require("pretty-bytes");

const SENT_TARGET = 20 * 1024 * 1024 * 1024 // 21.5 GB
const buf = Buffer.allocUnsafe(32 * 1024);

let sent = 0;

const now = Date.now();
const { encoder, decoder } = createCodec();

const source = from(function read(size, cb) {
    sent += buf.length;
    cb(null, buf);

    if (sent > SENT_TARGET) cb(null, null);
  })
  .pipe(encoder).pipe(decoder)
  .resume().on("end", function() {
    const delta = Date.now() - now;
    console.log(`Transforming ${prettyBytes(sent)} in ${delta}ms`);
  });
