import { randomBytes } from "crypto";
import Debug = require("debug");
import { PeerID } from "../../src/peerid/PeerID";

const debug = Debug("PeerID");
// debug.enabled = true;

import { assert } from "chai";

import {
  BUCKET_FIXTURES,
  CMP_FIXTURES,
  STRINGIFY_FIXTURES,
  XOR_FIXTURES,
} from "./PeerID.fixtures";

import { ID } from "../../src/p2p/CommonCrypto";

const t6 = new PeerID(randomBytes(20) as ID);
const t7 = new PeerID(randomBytes(20) as ID);
const t8 = new PeerID(t7.id);

describe("PeerID", () => {

  it("has ID_LENGTH constant defined", () => {
    assert.equal(PeerID.ID_LENGTH, 20);
  });

  describe(".xor", () => {
    XOR_FIXTURES.forEach(({ left, right, expected, text }, i) => {
      it("Case #" + ( i + 1 ) + "( " + text + " )", () => {
        assert.equal(PeerID.xor(left, right).equal(expected), true);
      });
    });
  });

  describe("#constructor", () => {

    it("creates an id with random buffer", () => {
      assert.notEqual(Buffer.compare(t7.id, t6.id), 0);
      assert.lengthOf(t7.id, PeerID.ID_LENGTH);
    });

    it("creates an id with given buffer", () => {
      assert.equal(Buffer.compare(t7.id, t8.id), 0);
    });

    it("throws if given buffer has incorrect length",  () => {
      assert.throws(() => new PeerID(Buffer.from([0, 0, 0]) as ID));
    });

  });

  describe(".compare(left, right)", () => {

    CMP_FIXTURES.forEach(({ left, right, expected, text }, i) => {
      it("Case #" + ( i + 1 ) + "( " + text + " )", () => {
        assert.equal(PeerID.compare(left, right), expected);
      });
    });

    it("works for two random PeerID", () => {
      const tn1 = new PeerID(randomBytes(20) as ID);
      const tn2 = new PeerID(randomBytes(20) as ID);

      assert.equal(
        PeerID.compare(tn1, tn2),
        Buffer.compare(tn1.id, tn2.id)
      );

    });
  });

  describe(".getBucket(observer, id)", () => {
    BUCKET_FIXTURES.forEach(({ observer, id, bucket }, i) => {
      it("Case #" + ( i + 1 ) + " bucket " + bucket, () => {
        assert.equal(PeerID.getBucket(observer, id), bucket);
      });
    });
  });

  describe("#xor", () => {
    XOR_FIXTURES.forEach(({ left, right, expected, text }, i) => {
      it("Case #" + ( i + 1 ) + "( " + text + " )", () => {
        assert.equal(left.xor(right).equal(expected), true);
      });
    });
  });

  describe("#toString", () => {
    STRINGIFY_FIXTURES.forEach(({ id, hex }, i) => {
      it("toString #" + ( i + 1 ) + "( " + hex + " )", () => {
        assert.equal(id.toString(), hex);
      });
    });
  });

});
