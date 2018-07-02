import { assert } from "chai";
import { randomBytes } from "crypto";
import Debug = require("debug");
import { ID } from "../../src/p2p/CommonCrypto";
import { PeerID } from "../../src/peerid/PeerID";
import { Hub } from "../../src/socket/Hub";

const debug = Debug("message");
// debug.enabled = true;

describe("Hub", () => {
  let hub;
  let u1;
  let u2;

  it("can be instanciated", () => {
    hub = new Hub(new PeerID(randomBytes(20) as ID));
    setTimeout(() => {
      debug(hub);
      debug(u1);
    }, 100);
    setTimeout(() => {
      hub.stop();
    }, 200);
  });

  it("user socket can be instanciated", () => {
    u1 = hub.newSocket("hello");
    u1.connect();
    u1.on("data", (r) => debug(r));
    u1.on("ping", (t) => debug("ping", t, u1.userid));

    u2 = hub.newSocket("hello2");
    u2.connect();
    u2.send({ user: "hello", data: "some" });
    u2.send({ user: "hello", data: "some" });
    u2.send({ user: "hello33", data: "some" });
    u2.send({ user: "hello33", data: "some" });
    u2.send({ user: "hello33", data: "some" });
    u2.send({ user: "hello33", data: "some" });
    u2.send({ user: "hello33", data: "some" });
  });

});
