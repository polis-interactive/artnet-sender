import { EventObject, fromCallback } from "xstate";

import { NetworkInterface } from "../types/network";
import { networkInterfaces } from 'os';

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

export const NetworkInterfaceLogic = fromCallback<EventObject, { defaultTimeoutInMs: number }>(
  ({ sendBack, receive, input: { defaultTimeoutInMs } }) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const checkNetworkInterfaces = () => {
      const interfaces = GetNetworkInterfaces();
      sendBack({
        type: 'NETWORK_INTERFACE_UPDATE',
        interfaces
      });
      timeoutId = setTimeout(() => checkNetworkInterfaces(), defaultTimeoutInMs);
    };
    checkNetworkInterfaces();
    receive(() => {
      clearTimeout(timeoutId);
      checkNetworkInterfaces();
    });
    return () => {
      clearTimeout(timeoutId);
    }
  });