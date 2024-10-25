<template>
  <section>
    <Select
      :modelValue="networkInterface"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :options="networkInterfaces"
      optionLabel="name"
      @change="updateIface"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex items-center">
          {{ slotProps.value.name }} ({{ slotProps.value.address }})
        </div>
        <span v-else>
            {{ slotProps.placeholder }}
        </span>
      </template>
      <template #option="slotProps">
        <div class="flex items-center">
            {{ slotProps.option.name }} ({{ slotProps.option.address }})
        </div>
      </template>
    </Select>
  </section>
</template>

<script setup lang="ts">
import { useArtnetStore } from '../store'
import { storeToRefs } from 'pinia'
import { NetworkInterface } from 'src/types/network';
import { computed, toRaw, watch } from 'vue'

const store = useArtnetStore();
const { networkInterfaces, networkInterface, state } = storeToRefs(store);

watch(networkInterface, (newNetworkInterface, oldNetworkInterface) => {
  console.log(newNetworkInterface, oldNetworkInterface);
}, { immediate: true });

const isDisabled = computed(() => {
  return state.value === 'waitingForMachine' || networkInterfaces.value.length === 0;
})

const placeholder = computed(() => {
  if (state.value === 'waitingForMachine') {
    return 'Waiting for network interfaces';
  } else if (networkInterfaces.value.length === 0) {
    return 'No network interfaces found';
  } else {
    return 'Select network interface';
  }
});

type NetworkInterfaceEvent = {
  value: NetworkInterface
}

const updateIface = ({ value }: NetworkInterfaceEvent) => {
  window.ArtnetSenderApi.selectNetworkInterface(toRaw(value));
}
</script>
