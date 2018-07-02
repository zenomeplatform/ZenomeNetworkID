import { duplex, through } from "mississippi2";
import protons = require("protons");
import { Duplex, Transform } from "readable-stream";
import { assert } from "chai";


export type Encode<T> = (data: T) => Buffer;
export type Decode<T> = (data: Buffer) => T;

export interface ICodec<T> {
  id: string;

  encode: Encode<T>;
  decode: Decode<T>;

  createTransformer(type: "encode"): Transform;
  createTransformer(type: "decode"): Transform;
}

export class Codec<T> implements ICodec<T> {

  public static debug = false;
  public static assert: Function;

  public static fromProtobuf<T>(schema: string, name: string, id?: string): Codec<T> {
    const compiled = protons(schema);
    const { encode, decode } = compiled[name];
    return new Codec(id || name, encode, decode);
  }

  constructor(
    public id: string,
    private _encode: Encode<T>,
    private _decode: Decode<T>
  ) {
    Object.freeze(this);
  }

  get decode() {
    if (!Codec.debug) return (chunk: Buffer) => this._decode(chunk);

    return (chunk: Buffer) => {
      const decoded = this._decode(chunk);
      console.log({ chunk, decoded });
      return decoded;
    };
  }

  get encode() {
    if (!Codec.debug) return (buf: T) => this._encode(buf);

    return (data: T) => {
      const encoded = this._encode(data);
      console.log({ data, encoded });
      return encoded;
    };
  }

  public createTransformer(type: "encode"|"decode") {
    switch (type) {
      case "encode": return this.createEncodeTransformer();
      case "decode": return this.createDecodeTransformer();
    }
    throw new Error("Please provide encode or decode argument.");
  }

  private createDecodeTransformer() {
    return through.obj(this.decode);
  }

  private createEncodeTransformer() {
    return through.obj(this.encode);
  }

}

interface BaseI {
  directive?: string;
  header?: Buffer;
  payload?: Buffer;
}
