
import { networkInterfaces } from 'os';

export type NetworkInterface = {
  name: string,
  address: string,
  netmask: string
}

export const IsSameNetworkInterface = (a: NetworkInterface, b: NetworkInterface): boolean => {
  return a.name === b.name && a.address === b.address && a.netmask === b.netmask;
}

export const GetNetworkInterfaces = (): Array<NetworkInterface> => {
  const interfaces = networkInterfaces();
  const retInterfaces: Array<NetworkInterface> = [];
  for (const [name, iFaces] of Object.entries(interfaces)) {

    const useIface = iFaces.find((iFace) => {
      return iFace.internal === false && iFace.family === 'IPv4';
    });
    if (useIface) {
      retInterfaces.push({
        name,
        address: useIface.address,
        netmask: useIface.netmask
      })
    }
  }
  return retInterfaces;
}

export const ParseIpAddress = (rawIpAddress: Array<number>): String | null => {
  if (rawIpAddress.length !== 4) {
    return null;
  }
  return `${rawIpAddress[0]}.${rawIpAddress[1]}.${rawIpAddress[2]}.${rawIpAddress[3]}`;
}

export class Writer {
  private buffer: Buffer;
  private offset: number;

  constructor(size: number = 512) {
      this.buffer = Buffer.alloc(size);
      this.offset = 0;
  }

  writeString(value: string, length: number): void {
      this.buffer.write(value, this.offset, length, 'ascii');
      this.offset += length;
  }

  writeBytesFrom(arr: Array<number>): void {
    for (let i = 0; i < arr.length; i++) {
      this.write(arr[i]);
    }
  }

  writeUInt16(value: number): void {
    this.buffer.writeUInt16LE(value, this.offset);
    this.offset += 2;
  }

  write(value: number): void {
      this.buffer.writeUInt8(value, this.offset);
      this.offset += 1;
  }

  toBuffer(): Buffer {
      return this.buffer.slice(0, this.offset);
  }
}

export class Reader {
  private buffer: Buffer;
  private offset: number;

  constructor(buffer: Buffer, offset: number = 0) {
      this.buffer = buffer;
      this.offset = offset;
  }

  readString(length: number): string {
    const value = this.buffer.toString('ascii', this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  readBytesInto(arr: Array<number>): void {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = this.read();
    }
  }

  readUInt16(): number {
    const value = this.buffer.readUInt16LE(this.offset);
    this.offset += 2;
    return value;
  }

  read(): number {
      const value = this.buffer.readUInt8(this.offset);
      this.offset += 1;
      return value;
  }
}