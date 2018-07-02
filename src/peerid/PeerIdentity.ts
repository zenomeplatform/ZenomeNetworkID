import { randomBytes } from "crypto";
import {
  createRandomPeerConfig,
  createSignFunction,
  getIDfromPublicKey,
  getPublicKeyFromSecretKey,
  ID, openMessage, SecretKey, SignMessage,
} from "../p2p/CommonCrypto";

import { PeerID } from "./PeerID";

export interface IPeerConfig {
  identity: {
    secretKey: SecretKey;
  };
}

/**
 * PeerID extended to allow signing data. Represents peer.
 *
 * @param config [description]
 */

export class Peer extends PeerID {

  public readonly id: ID;
  public readonly sign: SignMessage;

  constructor(config: IPeerConfig) {
    const secretKey = config.identity.secretKey;
    const publicKey = getPublicKeyFromSecretKey(secretKey);
    super(getIDfromPublicKey(publicKey));

    this.publicKey = publicKey;
    this.sign   = createSignFunction(secretKey);
  }

  public getPeerID(): PeerID {
    return new PeerID(this.id);
  }

}
