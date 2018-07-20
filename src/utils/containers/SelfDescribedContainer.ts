// src/utils/containers/SelfDescribedContainer.ts
import protons from "protons";
import { message } from '../protobuf/message';

/**
 * @example
 *
 * const container = new SelfDescribedContainer(
 *  `message Record {
 *      string name = 1;
 *      bytes data = 2;
 *   }`
 * )
 *
 * const d = container
 *     .add('Record', { name: 'record1', data: Buffer.from("hello") })
 *     .add('Record', { name: 'record1', data: Buffer.from("hello") })
 *     .dump()
 *
 * console.log(d.length)
 * console.log(SelfDescribedContainer.open(d));
 *
 */


/**
 * The protobuf scheme we use to define scheme of the data
 * and the data itself. The inner message Item used to store
 * one chunk of data of type "name".
 *
 * That implies that the container supports serizalizing many
 * types of records at the same time. To archieve so, one should
 * define multiple messages in the scheme of data.
 */

const DumpFormat = message `Dump {
  required string scheme = 1;
  repeated Item items  = 2;

  message Item {
    required string name = 1;
    required bytes data = 2;
  }
}`;


/**
 * Implementation of reading algorithm.
 * Returns scheme and data.
 */

function open(dump) {
  const { scheme, items } = DumpFormat.decode(dump);
  const compiled = protons(scheme);
  const _items = items.map(
    ({ name, data }) => compiled[name].decode(data)
  );

  return { items: _items, scheme };
}


export class SelfDescribedContainer {

  /** Internal object to store compiled protobuf coders */
  private compiled = protons(this.shema);
  /** Internal data store. Contains semi-serizalized data. */
  private items = [];

  /** open(dump) exposed as a static method */
  public static open(dump: Buffer) {
    return open(dump);
  }

  constructor(public shema: string) {}

  /** Add data to the container */
  public add(name, item) {
    const data = this.compiled[name].encode(item);
    this.items.push({ name, data });
    return this;
  }

  /** Returns data */
  public dump() {
    return DumpFormat.encode({
      scheme: this.shema, items: this.items
    });
  }

}
