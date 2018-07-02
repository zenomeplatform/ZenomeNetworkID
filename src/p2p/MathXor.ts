import { ID_LENGTH } from "../peerid/PeerID";

/**
 * XOR operation for Buffer of length ID_LENGTH
 *
 * @param  left  operand
 * @param  right operand
 * @return left xor right
 */

export function xor(left: Buffer, right: Buffer): Buffer {

 const buffer = Buffer.alloc(ID_LENGTH);

 for (let i = 0; i < ID_LENGTH; ++i) {
   buffer[i] = left[i] ^ right[i];
 }

 return buffer;
}

/**
 * Optimized Algorithm for calculating bucket index
 *
 * Both parameters are expected to be ID_LENGTH bytes long.
 *
 * @param  node point of view
 * @param  id   of an object in question
 * @returns {number} from 1 to 8 * ID_LENGTH
 */

export function getBucketIndex(node: Buffer, id: Buffer): number {
  let temp = 8 * ID_LENGTH + 1;
  let t1;

  for (let i = 0; !t1 && i < ID_LENGTH; i++) {
    t1 = node[i] ^ id[i]; temp -= 8;
  }

  while (t1)  {
    t1 = t1 >>> 1; temp++;
  }

  return temp;
}
