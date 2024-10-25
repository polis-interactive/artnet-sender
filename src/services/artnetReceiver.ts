
import * as dgram from 'dgram';
import { ARTNET_MULTICAST_ADDRESS, ARTNET_PORT, OpCode } from '../types/artnet/constants';
import { IsSameNetworkInterface, NetworkInterface } from '../types/network';
import { PollReplyPacket } from '../types/artnet/pollReplyPacket';
import { Packet } from '../types/artnet/packet';

export type ArtnetReceiverCallback = {
  onStarted: () => void;
  onArtnetReply: (packet: PollReplyPacket) => void;
  onWarn: (warning: string) => void;
  onError: (error: Error) => void;
  onStopped: () => void;
}

export class ArtnetReceiver {
  static #instance: ArtnetReceiver | null = null;

  #socket: dgram.Socket;
  #callbacks: Array<ArtnetReceiverCallback>;
  #iface: NetworkInterface;

  private constructor(callback: ArtnetReceiverCallback, iface: NetworkInterface) {
    this.#callbacks = [callback];
    this.#iface = iface;
    this.createServer();
  }

  private createServer() {
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true});
    socket.on('message', (msg, rInfo) => { void this.handleMessage(msg, rInfo); });
    socket.on('error', (err) => {
      this.handleError(err);
    });
    socket.on('close', () => {
      this.#callbacks.forEach(callback => callback.onStopped());
      console.log("ArtnetReceiver is closed");
    });
    socket.bind(ARTNET_PORT, this.#iface.address, () => {
      socket.setBroadcast(true);
      console.log(`ArtnetReceiver listening on ${this.#iface.address}:${ARTNET_PORT}`);
    });
    this.#callbacks.forEach(callback => callback.onStarted());
    this.#socket = socket;
  }

  private async handleMessage(msg: Buffer, _: dgram.RemoteInfo) {
    const artnetPacket = await Packet.parse(msg);
    if (!artnetPacket) {
      const warnMsg = `ArtnetReceiver.handleMessage recieved uknown packet: ${msg.toString()}`;
      console.warn(warnMsg);
      this.#callbacks.forEach(callback => callback.onWarn(warnMsg));
      return
    }
    switch (artnetPacket.opCode) {
      case OpCode.PollReply:
        this.#callbacks.forEach(callback => callback.onArtnetReply(artnetPacket as PollReplyPacket));
        break;
      default:
        const warnMsg = `ArtnetReceiver.handleMessage recieved unhandled artnet packet: ${msg.toString()}`;
        console.warn(warnMsg);
        this.#callbacks.forEach(callback => callback.onWarn(warnMsg));
        break;
    }
  }

  private handleError(err: Error) {
    console.error(`ArtnetReceiver.handleError received fatal error ${err}; resetting the server after 3s`);
    this.#callbacks.forEach(callback => callback.onError(err));
    this.#socket.close();
    setTimeout(() => this.createServer(), 3000);
  }

  private updateIface(iface: NetworkInterface) {
    if (IsSameNetworkInterface(this.#iface, iface)) {
      return;
    }
    this.#socket.close();  // will call callbacks.onClose
    this.#iface = iface;
    this.createServer();
  }

  public static StartServer(newCallback: ArtnetReceiverCallback, iface: NetworkInterface) {
    const instance = ArtnetReceiver.#instance;
    if (instance) {
      console.log('ArtnetReceiver.StartServer(callback, iface) already running, maybe callback and updating iface');
      if (!instance.#callbacks.find(callback => callback === newCallback)) {
        instance.#callbacks.push(newCallback);
      }
      instance.updateIface(iface);
      return instance;
    } else {
      ArtnetReceiver.#instance = new ArtnetReceiver(newCallback, iface);
      return ArtnetReceiver.#instance;
    }
  }

  public static SetIface(iface: NetworkInterface) {
    const instance = ArtnetReceiver.#instance;
    if (instance) {
      instance.updateIface(iface);
    }
  }

  public static StopServer(removeCallback: ArtnetReceiverCallback) {
    const instance = ArtnetReceiver.#instance;
    if (!instance) {
      return;
    }
    instance.#callbacks = instance.#callbacks.filter(callback => callback !== removeCallback);
    if (instance.#callbacks.length !== 0) {
      return;
    }
      
    instance.#socket.close();
    ArtnetReceiver.#instance = null;
  }

}