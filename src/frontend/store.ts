import { defineStore } from "pinia";
import type { ArtnetSenderContextStore, ArtnetSnapshot } from "../machine/artnetSender.machine";
import { computed, ref, Ref } from "vue";

export const FlattenState = (state: string | Record<string, unknown>): string => {
  while (typeof state !== 'string' && state !== null) {
    const entries = Object.entries(state);
    if (entries.length === 0) return 'unknown';
    const [_, subState] = entries[0];
    state = subState as string | Record<string, unknown>;
  }
  return state as string;
}

export const useArtnetStore = defineStore('artnet-state', () => {
  const snapshot: Ref<ArtnetSnapshot | null> = ref(null);
  const state = computed(() => {
    const useSnapshot = snapshot.value;
    if (!useSnapshot || !useSnapshot.value) {
      return 'waitingForMachine';
    }
    return FlattenState(useSnapshot.value);
  });
  const context = computed<ArtnetSenderContextStore>(() => {
    const useSnapshot = snapshot.value;
    if (!useSnapshot || !useSnapshot.context) {
      return {
        networkInterfaces: [],
        networkInterface: null
      }
    }
    return useSnapshot.context;
  });
  const networkInterface = computed(() => context.value.networkInterface);
  const networkInterfaces = computed(() => context.value.networkInterfaces);
  window.ArtnetSenderApi.startActor((newSnapshot) => snapshot.value = newSnapshot)
  return { snapshot, state, context, networkInterface, networkInterfaces };
});