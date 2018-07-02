import { createRandomPeerConfig, DataMessage, openMessage, SignedMessage } from "../../src/p2p/CommonCrypto";
import { Peer } from "../../src/peerid/PeerIdentity";

import Debug = require("debug");

const debug = Debug("PeerIdentity");

const test = new Peer(createRandomPeerConfig());

const message1 = Buffer.from("Hi");
const signed = Buffer.from(test.sign(message1 as DataMessage)) as SignedMessage;
const signature = Buffer.from(test.sign(message1 as DataMessage, true));

debug(signed.toString("hex"));
debug(
  signed.toString("hex") === signature.toString("hex") + message1.toString("hex")
);
debug(openMessage(signed, test.publicKey));
