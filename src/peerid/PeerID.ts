import { getIDfromPublicKey, ID, PublicKey } from "../p2p/CommonCrypto";
import { getBucketIndex, xor } from "../p2p/MathXor";

/**
 * @module PeerID 0.1.2
 *
 * PeerID is an unique identifier assigned to each node in the distributed
 *  environment, for example, by making use of identity-based cryptography.
 *  This module implements 20-byte ID space with XOR metric and provides a
 *  convinient interface to it.
 */

export const ID_LENGTH = 20; /** The ID buffer length in bytes. */

/**
 * PeerID is a wrapper-class around buffers to provide special methods.
 */

export class PeerID {
  public static ID_LENGTH = ID_LENGTH;

  public static fromPublicKey(pubKey: PublicKey): PeerID {
    const pid = new this(getIDfromPublicKey(pubKey));
    pid._publicKey = pubKey;

    return pid;
  }

  /**
   * Calculates the bitwise XOR operation of two PeerIDs.
   */
  public static xor(left: PeerID, right: PeerID): PeerID {
    return new PeerID(xor(left.id, right.id) as ID);
  }

  /**
   * Lexicographically compare two PeerIDs.
   */
  public static compare(left: PeerID, right: PeerID): number {
    return Buffer.compare(left.id, right.id);
  }

  /**
   * Get bucket index of address from node perspective.
   */
   public static getBucket(node: PeerID, address: PeerID): number {
     return getBucketIndex(node.id, address.id);
   }

   public id: ID;

   private _publicKey: PublicKey;

   public get publicKey(): PublicKey {
     return this._publicKey;
   }

   public set publicKey(publicKey: PublicKey) {
     if (this.id.equals(getIDfromPublicKey(publicKey))) {
       this._publicKey = publicKey;
     } else {
       throw new Error("PublicKey doesn't match.");
     }
   }

  /**
   * [constructor description]
   *
   * @param id
   */

  constructor(id: ID) {
    if (id.length !== ID_LENGTH) {
      throw new Error("Incorrect buffer length.");
    }
    this.id = Buffer.from(id) as ID;
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

  /**
   * Check if id and this are equal
   *
   * @param  id
   * @return    if this eq. id.
   */
  public equal(id: PeerID): boolean {
    return PeerID.compare(this, id) === 0;
  }

  /**
   * @returns String representation.
   */

  public toString(): string {
    return this.id.toString("hex");
  }

}

// TODO Consider returning index in range (0, 159)
