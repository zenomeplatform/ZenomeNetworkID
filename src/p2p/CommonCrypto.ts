import { hash, sign } from "tweetnacl";

import Debug from "debug";
const debug = new Debug("WARN");

/**
 * "Phantom types" for PublicKey, PrivateKey, SharedKey and so on.
 *
 * These interfaces all represent Buffer at runtime, but are different
 * for static type checker.
 */
export interface PublicKey        extends Buffer { __phantom_PublicKey__: never; }
export interface SecretKey        extends Buffer { __phantom_SecretKey__: never; }
export interface ID               extends Buffer { __phantom_ID__: never; }

export interface SharedKey        extends Buffer { __phantom_SharedKey__: never; }
export interface DataMessage      extends Buffer { __phantom_DataMessage__: never; }
export interface EncryptedMessage extends Buffer { __phantom_EncryptedMessage__: never; }
export interface SignedMessage    extends Buffer { __phantom_SignedMessage__: never; }

export type SignMessage = (message: DataMessage, detached?: boolean) => SignedMessage;

export interface IdentifiedMessage {
  message: DataMessage;
  peerid: ID;
}
//
//

export function getPublicKeyFromSecretKey(secretKey: SecretKey): PublicKey {
  const { publicKey } = sign.keyPair.fromSecretKey(secretKey);
  return Buffer.from(publicKey) as PublicKey;
}

 /**
  * Algorithm of generating ID from Public Key
  */
export function getIDfromPublicKey(pubKey: PublicKey): ID {
  const buffer = hash(pubKey).slice(0, 20);
  return Buffer.from(buffer) as ID;
}

// export function exportSecretKey(
//   secretKey: Buffer|Uint8Array
// ) {}

/**
 * If signedMsg is a valid signed message (for given publicKey),
 *  return the message and corresponding ID. Otherwise, throws error.
 *
 * @param  signedMsg Message to check signature
 * @param  publicKey Public Key from the key pair used to sign the message
 *
 * @return { IdentifiedMessage }
 */

export function openMessage(signedMsg: SignedMessage, publicKey: PublicKey): IdentifiedMessage {

  const message = sign.open(signedMsg, publicKey);

  return {
    message: Buffer.from(message)         as DataMessage,
    peerid: getIDfromPublicKey(publicKey) as ID
  };
}

export function createRandomPeerConfig() {
  debug("Function createRandomPeer should be used only for test purposes.");
  const keys = sign.keyPair();
  const config = { identity: { secretKey: keys.secretKey as SecretKey } };

  return config;
}

export function createSignFunction(secretKey: SecretKey): SignMessage {
  return (message: DataMessage, detached: boolean = false) =>
    !detached ? sign(message, secretKey) as SignedMessage
     : sign.detached(message, secretKey) as SignedMessage;
}
