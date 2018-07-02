/**
 * Tests for Codec
 *
 * @module Codec provides a convinient interface to data serialization.
 *
 * A part of distributed-js project. (c) Zenome
 */

import { assert } from "chai";
import { randomBytes } from "crypto";
import { Codec } from "../../src/utils/codecs";

function assertCodec<T>(codec: Codec<T>, data: T, _encoded: Buffer|string, message: string) {
  const encoded = (typeof _encoded === "string") ?
              Buffer.from(_encoded, "hex")
                        : _encoded;

  const encodedCheck = codec.encode(data);
  const decodedCheck = codec.decode(encoded);

  assert(encodedCheck.equals(encoded), message);
  assert.deepEqual(decodedCheck, data, message);
}

Codec.assert = assert;

describe("Codecs", function() {

  interface MockInterface {
    something: Buffer;
  }
  const encode = (data: MockInterface) => data.something;
  const decode = (something: Buffer) => ({ something });
  const id = "Simplest pair";
  const codec = new Codec(id, encode, decode);
  const buffer = randomBytes(20);

  it("Can be created from encode and decode functions", function() {
    assertCodec(codec, { something: buffer }, buffer, "works");
  });

  it("Has ID property", function() {
    assert.isString(codec.id, "Has ID property");
    assert.equal(codec.id, id, "id property has correct value");
  });

  it("implements Encode/Decode methods", function() {
    assert.isFunction(codec.encode, "Has ID property");
    assert.isFunction(codec.decode, "Has ID property");
  });

});
