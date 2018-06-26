import { randomBytes } from "crypto";
import tweetnacl = require("tweetnacl");

/**
 * @module PeerID 0.1.0
 *
 * PeerID is an unique identifier assigned to each node in the distributed
 *  environment, for example, by making use of identity-based cryptography.
 *  This module implements 20-byte ID space with XOR metric and provides a
 *  convinient interface to it.
 */

export const ID_LENGTH = 20; /** The ID buffer length in bytes. */

/**
 * PeerID is a wrapper-class around buffers to provide special methods.
 *
 * @api public: xor, compare, getBucket
 */

export class PeerID {

  public static ID_LENGTH = ID_LENGTH;

  /**
   * Calculates the bitwise XOR operation of two PeerIDs.
   *
   * @param  left  operand
   * @param  right operand
   * @return left (xor) right
   */

  public static xor(left: PeerID, right: PeerID): PeerID {

   const buffer = Buffer.alloc(ID_LENGTH);

   for (let i = 0; i < ID_LENGTH; ++i) {
     buffer[i] = left.buffer[i] ^ right.buffer[i];
   }

   return new PeerID(buffer);

  }

  /**
   * Lexicographically compare two PeerIDs.
   *
   * @param  left  [description]
   * @param  right [description]
   *
   * @return 0 if they are equal
   *         1 if left is higher than right
   *        -1 if left is lower than right
   */

  public static compare(left: PeerID, right: PeerID) {
    return Buffer.compare(left.buffer, right.buffer);
  }

  /**
   * Fast implementation of getBucketIndex function.
   *
   * @param  {PeerID} my
   * @param  {PeerID} target
   * @return {number}
   */

   public static getBucket(my: PeerID, id: PeerID): number {
     let t1;
     let t2;
     let i = 0;
     let j = 0;

     do {
       t1 = my.buffer[i] ^ id.buffer[i];
       ++i;
     } while (!t1 && i < ID_LENGTH);

     do {
       t2 = t1 >>> j;
       ++j;
     } while (t2  && j < 8        );

     return 160 - 8 * i + j;
   }

   public data: Map<string, any> = new Map();

  /**
   * [constructor description]
   *
   * @param buffer [description]
   */

  constructor(public buffer?: Buffer) {
    if (!buffer) {
      buffer = randomBytes(ID_LENGTH);
    }
    if (buffer.length !== ID_LENGTH) {
      throw new Error("Incorrect buffer length.");
    }
    this.buffer = Buffer.from(buffer);
  }

  /**
   * The same as PeerID.xor(this, id)
   *
   * @param  id other ID to compute xor
   * @return    xor of this and given id
   */

  public xor(id: PeerID): PeerID {
    return PeerID.xor(this, id);
  }

  public equal(id: PeerID): boolean {
    return PeerID.compare(this, id) === 0;
  }

}
