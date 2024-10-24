<template>
  <section>
    <Select
      :placeholder="placeholder"
      :disabled="isDisabled"
      :options="networkInterfaces"
      optionLabel="name"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex items-center">
          {{ slotProps.option.name }} ({{ slotProps.option.address }})
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
import { computed, watch } from 'vue'

const store = useArtnetStore();
const { networkInterfaces, networkInterface, state } = storeToRefs(store);

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
</script>
