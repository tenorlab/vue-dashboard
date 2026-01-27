<script setup lang="ts">
defineProps<{ title: string }>()
</script>
<template>
  <div class="dashboard-widget">
    <div class="absolute inset-0 bg-black flex flex-col items-center justify-center text-center">
      <div class="w-full absolute opacity-100 text-primary">{{ title }}</div>
      <div class="animate-ping rounded-full h-32 w-32 border-8 border-white"></div>
    </div>
  </div>
</template>
