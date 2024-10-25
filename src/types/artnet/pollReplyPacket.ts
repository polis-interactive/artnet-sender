import { Reader, Writer } from "../network";
import { OpCode } from "./constants";
import { Packet } from "./packet";


export class PollReplyPacket extends Packet {
  
  static minSize(): number {
    return 207;
  }
  
  public IpAddress: number[] = new Array(4).fill(0);
  public Port: number = 0;
  public VersionInfo: number = 0;
  public NetSwitch: number = 0;
  public SubSwitch: number = 0;
  public Oem: number = 0;
  public UbeaVersion: number = 0;
  public Status1: number = 0;
  public EstaCode: number = 0;
  public ShortName: string = '';
  public LongName: string = '';
  public NodeReport: string = '';
  public NumPorts: number = 0;
  public PortTypes: number[] = new Array(4).fill(0);
  public InputStatus: number[] = new Array(4).fill(0);
  public OutputStatus: number[] = new Array(4).fill(0);
  public InputSubSwitch: number[] = new Array(4).fill(0);
  public OutputSubSwitch: number[] = new Array(4).fill(0);
  public SwVideo: number = 0;
  public SwMacro: number = 0;
  public SwRemote: number = 0;
  public Spares: number[] = new Array(3).fill(0);
  public Style: number = 0;
  public MacAddress: number[] = new Array(6).fill(0);

  constructor() {
      super(OpCode.PollReply);
  }

  protected deserialize(reader: Reader): void {
      reader.readBytesInto(this.IpAddress);
      this.Port = reader.readUInt16();
      this.VersionInfo = reader.readUInt16();
      this.NetSwitch = reader.read();
      this.SubSwitch = reader.read();
      this.Oem = reader.readUInt16();
      this.UbeaVersion = reader.read();
      this.Status1 = reader.read();
      this.EstaCode = reader.readUInt16();
      this.ShortName = reader.readString(18);
      this.LongName = reader.readString(64);
      this.NodeReport = reader.readString(64);
      this.NumPorts = reader.readUInt16();
      reader.readBytesInto(this.PortTypes);
      reader.readBytesInto(this.InputStatus);
      reader.readBytesInto(this.OutputStatus);
      reader.readBytesInto(this.InputSubSwitch);
      reader.readBytesInto(this.OutputSubSwitch);
      this.SwVideo = reader.read();
      this.SwMacro = reader.read();
      this.SwRemote = reader.read();
      reader.readBytesInto(this.Spares);
      this.Style = reader.read();
      reader.readBytesInto(this.MacAddress);
  }

  protected serialize(writer: Writer): void {
      super.serialize(writer);
      writer.writeBytesFrom(this.IpAddress);
      writer.writeUInt16(this.Port);
      writer.writeUInt16(this.VersionInfo);
      writer.write(this.NetSwitch);
      writer.write(this.SubSwitch);
      writer.writeUInt16(this.Oem);
      writer.write(this.UbeaVersion);
      writer.write(this.Status1);
      writer.writeUInt16(this.EstaCode);
      writer.writeString(this.ShortName, 18);
      writer.writeString(this.LongName, 64);
      writer.writeString(this.NodeReport, 64);
      writer.writeUInt16(this.NumPorts);
      writer.writeBytesFrom(this.PortTypes);
      writer.writeBytesFrom(this.InputStatus);
      writer.writeBytesFrom(this.OutputStatus);
      writer.writeBytesFrom(this.InputSubSwitch);
      writer.writeBytesFrom(this.OutputSubSwitch);
      writer.write(this.SwVideo);
      writer.write(this.SwMacro);
      writer.write(this.SwRemote);
      writer.writeBytesFrom(this.Spares);
      writer.write(this.Style);
      writer.writeBytesFrom(this.MacAddress);
  }

  public static constructFromBuffer(buffer: Buffer): PollReplyPacket {
      const packet = new PollReplyPacket();
      const reader = new Reader(buffer, PollReplyPacket.minSize());
      packet.deserialize(reader);
      return packet;
  }
}