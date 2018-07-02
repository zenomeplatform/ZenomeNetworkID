/**
 * @internal
 */

import { PeerID } from "../peerid/PeerID";
import { EventDispatcher } from "../utils/events";
import { INetworkFrame } from "./Interfaces";
import { UserSocket } from "./UserSocket";

import Debug = require("debug");
const debug = Debug("Hub");
// debug.enabled = true;
/*
 * Events of Hub
 *
 * @event connected
 * @event disconnected
 * @event data
 * @event error
 */

/**
 * @internal
 */

export class Hub extends EventDispatcher {

  private users = new Map<string, UserSocket>();

  constructor(public id: PeerID) {
    super();

    const heart = setInterval((i) => this.trigger("beat", Date.now() / 1000 | 0), 1000);
    this.once("stop", () => clearInterval(heart));

    const onConnected = (user: UserSocket) => this.users.set(user.uid, user);
    const onDisconnected = (user: UserSocket) => this.users.delete(user.uid);

    this.on({
      connected: onConnected,
      disconnected: onDisconnected
    });

    this.on({
      data: ({ data, event }) => debug("Data was not delivered", { data, event }),
      beat: (time) => this.users.forEach((user: UserSocket) => user.trigger("ping", time))
    });
  }

  public stop() {
    this.trigger("stop");
    this.users.forEach((user: UserSocket) => {
      user.trigger("close");
    });
  }

  public newSocket(uid: string): UserSocket {
    return new UserSocket(uid, this);
  }

  public broadcast(frame: INetworkFrame) {
    this.users.forEach((u: UserSocket) => u.trigger("broadcast", frame));
  }

  public dispatch(frame: INetworkFrame) {
    this.useremit(frame.user, "data", frame);
  }

  public useremit(uid: string, event: string, data: any): boolean {
    if (!uid || !this.users.has(uid)) {
      this.trigger("data", { event, data });
      return false;
    } else {
      this.users.get(uid).trigger(event, data);
      return true;
    }
  }

}
