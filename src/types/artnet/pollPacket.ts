import { Reader, Writer } from "../network";
import { OpCode } from "./constants";
import { Packet } from "./packet";


export class PollPacket extends Packet {

  public buffer: Buffer | null;

  static minSize(): number {
    return 14;
  }

  constructor(private readonly alloc: Boolean = true, private _flags: number = 0, private _priority: number = 0) {
      super(OpCode.Poll);
      if (this.alloc) {
        const writer = new Writer(PollPacket.minSize());
        this.serialize(writer);
        this.buffer = writer.toBuffer();
      }
  }

  get flags(): number {
    return this._flags;
  }
  set flags(value: number) {
    this._flags = value;
    // todo: set buffer if present
  }

  get priority(): number {
    return this._priority
  }
  set priority(value: number) {
    this._priority = value;
    // todo: set buffer if present
  }

  protected serialize(writer: Writer): void {
    super.serialize(writer);
    writer.write(this.flags);
    writer.write(this.priority);
  }

  protected deserialize(reader: Reader): void {
    this.flags = reader.read();
    this.priority = reader.read();
  }

  public static constructFromBuffer(buffer: Buffer): PollPacket {
    const packet = new PollPacket(false);
    const reader = new Reader(buffer, PollPacket.minSize());
    packet.deserialize(reader);
    return packet;
  }
}