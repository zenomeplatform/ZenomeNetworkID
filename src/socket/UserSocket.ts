import { EventDispatcher } from "../utils/events";
import { Hub } from "./Hub";
import { INetworkFrame } from "./Interfaces";

import { inspect } from "util";

import Debug from "debug";

const debug = new Debug("UserSocket");
// debug.enabled = true;

enum ConnectionState {
  Created    = 0,
  Opened     = 1,
  Identified = 2,
  Closed     = -1
}

export class UserSocket extends EventDispatcher {

  private state: ConnectionState = ConnectionState.Created;

  get uid() {
    return this.userid;
  }

  constructor(
      private userid: string,
      private hub: Hub
    ) {

    super();

    const onOpen = () => {
      this.hub.trigger("connected", this);
      this.state = ConnectionState.Opened;
    };

    const onClose = () => {
      this.hub.trigger("disconnected", this);
      this.state = ConnectionState.Closed;
    };

    this.once("open", onOpen);
    this.once("close", onClose);

  }

  public [inspect.custom](depth, options) {
    return `User { id: "${this.userid}" }`;
  }

  public send(message: INetworkFrame) {
    if (this.state > 0) {
      return this.hub.dispatch(message);
    }
  }

  /**
   * @event open
   *
   * Fires when ready to communicate.
   */
  public connect() {
    return this.trigger("open");
  }

  /**
   * @event close
   *
   * Stops communications using this object
   */
  public disconnect() {
    return this.trigger("close");
  }

}

/*
 * Events of UserSocket
 *
 * @event data       fires when there is an incoming message
 * @event broadcast  fires when there is an a broadcast message
 * @event error
 */
