import { NetworkInterface } from "../types/network";
import { ActorRefFrom, AnyEventObject, assign, enqueueActions, EventFrom, setup, SnapshotFrom } from "xstate";
import { IsSameNetworkInterface, NetworkInterfaceLogic } from "./network.logic";

export type ArtnetSenderInput = {
  networkInterfacePollingIntervalInMs: number;
};

export type ArtnetSenderContext = {
  networkInterfacePollingIntervalInMs: number;
  networkInterfaces: Array<NetworkInterface>,
  networkInterface: NetworkInterface | null
};

export type ArtnetSenderContextStore = Omit<ArtnetSenderContext, 'networkInterfacePollingIntervalInMs'>

export const ArtnetSenderMachine = setup({
  types: {
    input: {} as ArtnetSenderInput,
    context: {} as ArtnetSenderContext
  },
  actors: {
    networkInterfaceActor: NetworkInterfaceLogic
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
    setNetworkInterface: assign({
      networkInterface: ({event}) => event.networkInterface
    })
  }
}).createMachine({
  id: 'ArtnetSenderMachine',
  context: ({ input }) => ({
    networkInterfacePollingIntervalInMs: input.networkInterfacePollingIntervalInMs,
    networkInterfaces: [],
    networkInterface: null
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
      on: {
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
