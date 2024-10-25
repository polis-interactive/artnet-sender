import { NetworkInterface, IsSameNetworkInterface } from "../types/network";
import { ActorRefFrom, AnyEventObject, assign, enqueueActions, EventFrom, setup, SnapshotFrom } from "xstate";
import { NetworkInterfaceLogic } from "./network.logic";
import { ArtnetReceiverLogic } from "./artnetReceiver.logic";
import { ArtnetReceiver } from "../services/artnetReceiver";

export type ArtnetSenderInput = {
  networkInterfacePollingIntervalInMs: number;
  artnetPollingIntervalInMs: number; 
};

export type ArtnetSenderContext = {
  networkInterfacePollingIntervalInMs: number;
  networkInterfaces: Array<NetworkInterface>,
  networkInterface: NetworkInterface | null,
  artnetPollingIntervalInMs: number;
  artnetPollReplies: Array<string>;
};

export type ArtnetSenderContextStore = Pick<
  ArtnetSenderContext,
  'networkInterfaces' | 'networkInterface' | 'artnetPollReplies'
>

export const ArtnetSenderMachine = setup({
  types: {
    input: {} as ArtnetSenderInput,
    context: {} as ArtnetSenderContext
  },
  actors: {
    networkInterfaceActor: NetworkInterfaceLogic,
    artnetReceiverActor: ArtnetReceiverLogic
  },
  actions: {
    updateNetworkInterfaces: enqueueActions(({ context: { networkInterface }, enqueue, event}) => {
      const networkInterfaces = (event as AnyEventObject).interfaces as Array<NetworkInterface>;
      enqueue.assign({
        networkInterfaces: () => [...networkInterfaces]
      });
      if (networkInterface && !networkInterfaces.find((iFace) => IsSameNetworkInterface(networkInterface, iFace))) {
        enqueue.assign({
          networkInterface: () => null
        });
        enqueue.raise({ type: 'NETWORK_INTERFACE_UNSET' })
      }
    }),
    setNetworkInterface: enqueueActions(({ enqueue, event }) => {
      const networkInterface = (event as AnyEventObject).networkInterface as NetworkInterface;
      enqueue.assign({
        networkInterface: () => networkInterface
      });
      ArtnetReceiver.SetIface(networkInterface);
    })
  }
}).createMachine({
  id: 'ArtnetSenderMachine',
  context: ({ input }) => ({
    networkInterfacePollingIntervalInMs: input.networkInterfacePollingIntervalInMs,
    networkInterfaces: [],
    networkInterface: null,
    artnetPollingIntervalInMs: input.artnetPollingIntervalInMs,
    artnetPollReplies: []
  }),
  invoke: [
    {
      id: 'networkInterfaceActor',
      src: 'networkInterfaceActor',
      input: ({ context: { networkInterfacePollingIntervalInMs }}) => ({ defaultTimeoutInMs: networkInterfacePollingIntervalInMs })
    }
  ],
  initial: 'waitingForNetworkInterface',
  states: {
    waitingForNetworkInterface: {
      on: {
        'NETWORK_INTERFACE_SET': {
          actions: 'setNetworkInterface',
          target: 'running'
        }
      }
    },
    running: {
      invoke: [
        {
          id: 'artnetReceiverActor',
          src: 'artnetReceiverActor',
          input: ({ context: { networkInterface }}) => ({ networkInterface })
        }
      ],
      on: {
        'NETWORK_INTERFACE_SET': {
          actions: 'setNetworkInterface'
        },
        'NETWORK_INTERFACE_UNSET': {
          target: 'waitingForNetworkInterface'
        }
      }
    }
  },
  on: {
    'NETWORK_INTERFACE_UPDATE': {
      actions: 'updateNetworkInterfaces'
    }
  }
});


export type ArtnetSnapshot = SnapshotFrom<typeof ArtnetSenderMachine>;
export type ArtnetSnapshotCallback = (snapshot: ArtnetSnapshot) => void;

export type ArtnetEvent = EventFrom<typeof ArtnetSenderMachine>;
export type ArtnetEventCallback = (event: ArtnetEvent) => void;

export type ArtnetActor = ActorRefFrom<typeof ArtnetSenderMachine>
