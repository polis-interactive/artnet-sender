
export const ARTNET_PORT = 6454;
export const ARTNET_MULTICAST_ADDRESS = "255.255.255.255";

export const ART_NET_ID = "Art-Net\0";
export const IDENTIFICATION_IDS = Buffer.from(ART_NET_ID, 'ascii');
export const IDENTIFICATION_IDS_LENGTH = IDENTIFICATION_IDS.length;
export const PROTOCOL_VERSION = 14;

// byte[8] for id, u16 for opcode version
export const FIXED_ART_NET_PACKET_LENGTH = IDENTIFICATION_IDS_LENGTH + 2;

export enum OpCode {
  Poll = 0x2000,
  PollReply = 0x2100,
  Dmx = 0x5000
}
