import * as nacl from "tweetnacl";

/**
 * Adaptor for the "tweetnacl" library.
 *
 * Provides the same sets of features in more convinient way,
 *  and allowing for typechecking thanks to "phantom types" approach.
 *
 * Exposed API:
 *
 *   [Functions]
 *    hash
 *    randomBytes
 *
 *
 *   [Namespaces]
 *    Encryption
 *
 *     [Types]
 *      Encryption.PublicKey
 *      Encryption.SecretKey
 *      Encryption.SharedKey
 *      Encryption.Nonce
 *      Encryption.EncryptedMessage
 *      Encryption.KeyPair
 *
 *     [Functions]
 *      Encryption.generateBoxKeyPair
 *      Encryption.encryptMessage
 *      Encryption.decryptMessage
 *      Encryption.deriveSharedKey
 *      Encryption.randomNonce
 *      Encryption.getBoxKeyPairFromSecretKey
 *
 *    Signing
 *
 *     [Types]
 *      Signing.PublicKey
 *      Signing.SecretKey
 *      Signing.KeyPairSeed
 *      Signing.KeyPair
 *      Signing.Signature
 *
 *    [Functions]
 *      Signing.generateSignKeyPair
 *      Signing.getSignKeyPairFromSecretKey
 *      Signing.getSignature
 *      Signing.verifySignature
 *
 *
 */



export namespace Encryption {


  /**
   * Phantom-interface that allows to typecheck encryption public keys.
   *
   * A public key is a buffer of 32 bytes.
   */

  export interface PublicKey extends Buffer {
    length: 32;
    role: "encryption";
    key: "public";
  }

  /**
   * Phantom-interface that allows to typecheck encryption secret keys.
   *
   * A secret key is a buffer of 32 bytes.
   */

  export interface SecretKey extends Buffer {
    length: 32;
    role: "encryption";
    key: "secret";
  }


  /**
   * Phantom-interface that allows to typecheck encryption shared keys.
   *
   * A shared key is a buffer of 32 bytes.
   */

  export interface SharedKey extends Buffer {
    length: 32;
    role: "encryption";
    key: "shared";
  }

  /**
   * Nonces should never be reused for a particular key.
   * This may lead to a security issue.
   */

  export interface Nonce extends Buffer {
    length: 24;
    role: "nonce";
  }

  /**
   * EncryptedMessage is longer than the original:
   *
   * overheadLength = 16 bytes.
   */

  export interface EncryptedMessage extends Buffer {
    role: "encryption";
    message: "encrypted";
  }

  /**
   * A pair of cryptographic keys for encryption.
   */
  export interface KeyPair {
    secretKey: SecretKey;
    publicKey: PublicKey;
  }

  /**
   * Randomly generate a new keypair.
   */
  export function generateBoxKeyPair() {
    const keys = nacl.box.keyPair();
    return asBuffers(keys);
  }



  export function encryptMessage(message: Buffer, nonce: Nonce, sharedKey: SharedKey) {

    const encrypted = nacl.box.after(message, nonce, sharedKey);

    //
    // Using another interface, namely `nacl.box` is actually the same thing.
    // It computes sharedKey under the hood.
    //

    //
    // We decided to provide powerful yet simple interface to cryto primitives
    // and remove nonsense functions.
    //

    return encrypted as EncryptedMessage;
  }


  export function decryptMessage(encrypted: Buffer, nonce: Buffer, sharedKey: SecretKey) {

    const message = nacl.box.open.after(encrypted, nonce, sharedKey);

    //
    // Please note that the same nonce used when encrypting is required
    //

    return encrypted as Buffer;

  }

  export function deriveSharedKey(theirPublicKey: PublicKey, ourSecretKey: SecretKey) {

    return nacl.box.before(theirPublicKey, ourSecretKey) as SharedKey;

  }

  export function randomNonce() {

    return randomBytes(24) as Nonce;

  }

  /**
   * Takes Secret key and restores the corresponding public key,
   *
   * @param  secretKey  secret key
   * @return a key pair of this secretKey and corresponding private one.
   */
  export function getBoxKeyPairFromSecretKey(_secretKey) {
    const keys = nacl.box.keyPair.fromSecretKey(_secretKey);
    return asBuffers(keys);
  }

}


export namespace Signing {

  /**
   * Phantom-interface that allows to typecheck signing public keys.
   *
   * A public key is a buffer of 32 bytes.
   */
  export interface PublicKey extends Buffer {
    length: 32;
    role: "signing";
    key: "public";
  }

  /**
   * Phantom-interface that allows to typecheck signing secret keys.
   *
   * A secret key is a buffer of 64 bytes.
   */
  export interface SecretKey extends Buffer {
    length: 64;
    role: "signing";
    key: "secret";
  }

  /**
   * 32bytes KeyPairSeed
   */
  export interface KeyPairSeed extends Buffer {
    length: 32;
    role: "signing";
    key: "seed";
  }

  /**
   * 64bytes Signature
   */
  export interface Signature extends Buffer {
    length: 64;
    role: "signature";
  }

  /**
   * A pair of cryptographic keys for signing.
   */
  export interface KeyPair {
    secretKey: SecretKey;
    publicKey: PublicKey;
  }

  /**
   * Generates new pair of keys for signing.
   *
   * If seed is provided as its only argument it's used to generate
   * the keypair. Otherwise, a random seed is generated first.
   *
   * @param  seed     seed for keypair generation (32 bytes)
   * @returns         an object with both secret and public key
   */

  export function generateSignKeyPair(seed?: KeyPairSeed) {

    const keys = seed ?
      nacl.sign.keyPair.fromSeed(seed) :
      nacl.sign.keyPair();

    return asBuffers(keys) as KeyPair;
  }


  /**
   * Takes Secret key and restores the corresponding public key,
   *
   * @param  secretKey  secret key
   * @return a key pair of this secretKey and corresponding private one.
   */

  export function getSignKeyPairFromSecretKey(secretKey: SecretKey) {

    const keys = nacl.sign.keyPair.fromSecretKey(secretKey);

    return asBuffers(keys) as KeyPair;
  }

  /**
   * Return the cryptographic digital signature of
   * the message signed by a provided secret key.
   *
   * @param  message   The message to sign
   * @param  secretKey The secret key used
   * @return           Signature
   */

  export function getSignature(message: Buffer, secretKey: SecretKey) {

    // The detached variant is the more fundamental one, since:
    //
    //   nacl.sign(message, ...)
    //
    //       ...is the same as...
    //
    //   Buffer.concat([ message, signature ])

    const signature = nacl.sign.detached(message, secretKey);

    return Buffer.from(signature) as Signature;
  }

  /**
   * If signature is valid for a provided message and public key,
   * returns true. Otherwise --- false.
   *
   * @param  message   The message to sign
   * @param  signature A digital signature
   * @param  publicKey The public key that corresponds to private key
   *                   used to sign a message.
   */
  export function verifySignature(message: Buffer, signature: Buffer, publicKey): boolean {

    //
    // To check data provided by  nacl.sign(...)
    // one may split it into two buffers, with the last
    // having length 64 bytes.
    //
    // These parts will be message and signature.
    //

    return nacl.sign.detached.verify(message, signature, publicKey);
  }

}

/**
 * Returns a Buffer of the given length containing random
 * bytes of cryptographic quality.
 *
 * It uses the following methods to generate random bytes,
 * depending on the platform it runs on:
 *
 *  - window.crypto.getRandomValues    (WebCrypto standard)
 *  - window.msCrypto.getRandomValues  (Internet Explorer 11)
 *  - crypto.randomBytes               (Node.js)
 *
 * If the platform doesn't provide a suitable PRNG, functions,
 * which require random numbers, will throw exception
 *
 * @param  size Requered length of a buffer
 * @returns a buffer containing random bytes of cryptographic quality.
 */

export function randomBytes(size: number): Buffer {
  return Buffer.from(
    nacl.randomBytes(size)
  );
}



/**
 * Returns SHA-512 hash of the message.
 */
export function hash(message: Buffer|Uint8Array): Buffer {
  return Buffer.from(
    nacl.hash(message)
  );
}


function asBuffers(keys: any) {
  return {
    publicKey: Buffer.from(keys.publicKey),
    secretKey: Buffer.from(keys.secretKey)
  }
}
