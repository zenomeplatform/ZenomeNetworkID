import { PeerID } from "../../src/p2p/PeerID";

/** Mocking PeerID */
const buf0 = Buffer.alloc(20);
const buf1 = Buffer.alloc(20);   buf1[0] = 1;
const buf2 = Buffer.alloc(20);   buf2[1] = 5;
const buf3 = Buffer.alloc(20);   buf3[1] = 1;
const buf4 = Buffer.alloc(20);   buf4[3] = 1;

const buf5 = Buffer.alloc(20);
buf5[0] = 1; buf5[1] = 1; // buf5[3] = 1;

const t0 = new PeerID(buf0);
const t1 = new PeerID(buf1);
const t2 = new PeerID(buf2);
const t3 = new PeerID(buf3);
const t4 = new PeerID(buf4);
const t5 = new PeerID(buf5);

export const XOR_FIXTURES = [
  { left: t1, right: t3, expected: t5, text: "t1 xor t3 = t5" },
  { left: t3, right: t1, expected: t5, text: "t3 xor t1 = t5" },
  { left: t1, right: t1, expected: t0, text: "t1 xor t1 = 0 " },
];

export const CMP_FIXTURES = [
  { expected:  0, left: t1, right: t1, text: "t1 = t1" },
  { expected:  0, left: t2, right: t2, text: "t2 = t2" },
  { expected:  0, left: t3, right: t3, text: "t3 = t3" },
  { expected:  1, left: t1, right: t2, text: "t1 > t2" },
  { expected:  1, left: t1, right: t3, text: "t1 > t3" },
  { expected:  1, left: t2, right: t3, text: "t2 > t3" },
  { expected: -1, left: t2, right: t1, text: "t2 < t1" },
  { expected: -1, left: t3, right: t1, text: "t3 < t1" },
  { expected: -1, left: t3, right: t2, text: "t3 < t2" },
];

export const BUCKET_FIXTURES = [
  { observer: t1, id: t2, bucket: 154 },
  { observer: t1, id: t3, bucket: 154 },
  { observer: t1, id: t4, bucket: 154 },
  { observer: t2, id: t3, bucket: 148 },
  { observer: t2, id: t4, bucket: 148 },
  { observer: t3, id: t4, bucket: 146 },
  { observer: t1, id: t1, bucket: 1 },
];
