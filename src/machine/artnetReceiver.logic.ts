import { PollReplyPacket } from "src/types/artnet/pollReplyPacket";
import { ArtnetReceiver, ArtnetReceiverCallback } from "../services/artnetReceiver";
import { NetworkInterface, ParseIpAddress } from "../types/network";
import { EventObject, fromCallback } from "xstate";


export const ArtnetReceiverLogic = fromCallback<
  EventObject, { networkInterface: NetworkInterface }
>(
  ({ sendBack, input: { networkInterface}}) => {
    const callback: ArtnetReceiverCallback = {
      onStarted: function (): void {
        sendBack({
          type: 'ARTNET_RECEIVER_STARTED',    
        });
      },
      onArtnetReply: function (packet: PollReplyPacket): void {
        const address = ParseIpAddress(packet.IpAddress);
        if (!address) {
          sendBack({
            type: 'ARTNET_RECEIVER_WARNING',
            warning: "Couldn't parse poll reply"
          });
          return;
        }
        sendBack({
          type: 'ARTNET_RECEIVER_POLLREPLY',
          address: packet.IpAddress
        });
      },
      onWarn: function (warning: string): void {
        sendBack({
          type: 'ARTNET_RECEIVER_WARNING',
          warning    
        });
      },
      onError: function (error: Error): void {
        sendBack({
          type: 'ARTNET_RECEIVER_ERROR',
          error    
        });
      },
      onStopped: function (): void {
        sendBack({
          type: 'ARTNET_RECEIVER_STOPPED',    
        });
      }
    };
    ArtnetReceiver.StartServer(
      callback,
      networkInterface
    );
    return () => {
      ArtnetReceiver.StopServer(callback);
    }
  }
);