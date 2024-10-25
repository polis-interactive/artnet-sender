import { Reader, Writer } from "../network";
import * as constants from "./constants";

export abstract class Packet {

  protected constructor(
    public readonly opCode: constants.OpCode, 
    public protocolVersion = constants.PROTOCOL_VERSION
  ) {}

  public static constructFromBuffer(buffer: Buffer): Packet {
    throw new Error("Packet.constructFromBuffer is not implemented");
  }

  protected static minSize(): number {
    throw new Error("Packet.minSize is not implemented")
  }

  protected abstract deserialize(reader: Reader): void;

  protected serialize(writer: Writer): void {
    writer.writeString(constants.ART_NET_ID, 8);
    writer.write(this.opCode);
  }
  
  public static async parse(buffer: Buffer): Promise<Packet | null> {
    if (!Packet.validate(buffer)) return null;
    const opCode = Packet.getOpCode(
      Uint8Array.prototype.slice.call(
        buffer,
        constants.IDENTIFICATION_IDS_LENGTH,
        constants.IDENTIFICATION_IDS_LENGTH + 2
      )
    );
    switch (opCode) {
        case constants.OpCode.Poll:
            const { PollPacket } = await import('./pollPacket');
            if (buffer.length >= PollPacket.minSize()) {
              return PollPacket.constructFromBuffer(buffer);
            }
            break;
        case constants.OpCode.PollReply:
          const { PollReplyPacket } = await import('./pollReplyPacket');
          if (buffer.length >= PollReplyPacket.minSize()) {
            return PollReplyPacket.constructFromBuffer(buffer);
          }
          break;
          
            /*
        case constants.OpCode.Dmx:
            return new DmxPacket(buffer);
            */
        default:
            return null;
    }
    return null;
  }
  
  private static validate(buffer: Buffer): boolean {
    if (buffer.length < constants.FIXED_ART_NET_PACKET_LENGTH) {
      return false
    };
    for (let i = 0; i < constants.IDENTIFICATION_IDS_LENGTH; i++) {
        if (buffer[i] !== constants.IDENTIFICATION_IDS[i]) return false;
    }
    return true;
  }

  private static getOpCode(buffer: Buffer): constants.OpCode {
    return (buffer[0] + (buffer[1] << 8)) as constants.OpCode;
  }
  
}