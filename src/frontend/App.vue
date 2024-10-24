<template>
  <section id="main" class="bg-slate-700 text-white flex flex-col">
    <header class="bg-slate-900 px-4 py-2 flex-initial">
      <h1 class="text-2xl font-semibold tracking-wide">
        Artnet Sender
      </h1>
    </header>
    <main class="flex-auto overflow-auto flex flex-row w-screen">
      <div class="flex flex-col shrink-0 grow-[1] basis-auto border-slate-500 border-r-2">
        <div class="shrink-0 basis-auto grow-[1] border-slate-500 border-b-2 p-1">
          <NetworkInterfaceSelector />
        </div>
        <div class="shrink-0 basis-auto grow-[1] p-1">
          <ArtnetPolling />
        </div>
      </div>
      <div class="flex flex-col flex-none shrink-0 grow-[4] basis-auto">
        <div class="shrink-0 basis-auto grow-[2] border-slate-500 border-b-2 p-1">
          <ArtnetDisplay />
        </div>
        <div class="shrink-0 basis-auto grow-[1] p-1">
          <ArtnetControls />
        </div>
      </div>
    </main>
  </section>
</template>

<script setup lang="ts">
import NetworkInterfaceSelector from './components/NetworkInterfaceSelector.vue'
import ArtnetPolling from './components/ArtnetPolling.vue'
import ArtnetDisplay from './components/ArtnetDisplay.vue'
import ArtnetControls from './components/ArtnetControls.vue'
</script>

<style>
html, body, #app, #main {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>