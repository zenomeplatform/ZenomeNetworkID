import Debug = require("debug");
import { PeerID } from "../../src/p2p/PeerID";

const debug = Debug("PeerID");
debug.enabled = true;

import { assert } from "chai";
import { BUCKET_FIXTURES, CMP_FIXTURES, XOR_FIXTURES } from "./PeerID.fixtures";

const t6 = new PeerID();
const t7 = new PeerID();
const t8 = new PeerID(t7.buffer);

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

  describe("#xor", () => {
    XOR_FIXTURES.forEach(({ left, right, expected, text }, i) => {
      it("Case #" + ( i + 1 ) + "( " + text + " )", () => {
        assert.equal(left.xor(right).equal(expected), true);
      });
    });
  });

  describe("#constructor", () => {

    it("creates an id with random buffer", () => {
      assert.notEqual(Buffer.compare(t7.buffer, t6.buffer), 0);
      assert.lengthOf(t7.buffer, PeerID.ID_LENGTH);
    });

    it("creates an id with given buffer", () => {
      assert.equal(Buffer.compare(t7.buffer, t8.buffer), 0);
    });

    it("throws if given buffer has incorrect length",  () => {
      assert.throws(() => new PeerID(Buffer.from([0, 0, 0])));
    });

  });

  describe(".compare(left, right)", () => {

    CMP_FIXTURES.forEach(({ left, right, expected, text }, i) => {
      it("Case #" + ( i + 1 ) + "( " + text + " )", () => {
        assert.equal(PeerID.compare(left, right), expected);
      });
    });

    it("works for two random PeerID", () => {
      const tn1 = new PeerID();
      const tn2 = new PeerID();

      assert.equal(
        PeerID.compare(tn1, tn2),
        Buffer.compare(tn1.buffer, tn2.buffer)
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

});
