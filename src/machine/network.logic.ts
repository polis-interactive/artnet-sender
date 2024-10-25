import { EventObject, fromCallback } from "xstate";

import { GetNetworkInterfaces } from "../types/network";


export const NetworkInterfaceLogic = fromCallback<EventObject, { defaultTimeoutInMs: number }>(
  ({ sendBack, receive, input: { defaultTimeoutInMs } }) => {
    let hasQuit = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const checkNetworkInterfaces = () => {
      const interfaces = GetNetworkInterfaces();
      sendBack({
        type: 'NETWORK_INTERFACE_UPDATE',
        interfaces
      });
      if (!hasQuit) {
        timeoutId = setTimeout(() => checkNetworkInterfaces(), defaultTimeoutInMs);
      }
    };
    checkNetworkInterfaces();
    receive(() => {
      clearTimeout(timeoutId);
      checkNetworkInterfaces();
    });
    return () => {
      hasQuit = true;
      clearTimeout(timeoutId);
    }
  });