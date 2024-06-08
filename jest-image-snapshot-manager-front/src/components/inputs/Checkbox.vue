<template>
  <div class="flex items-end gap-2">
    <span :class="['checkbox', { selected: model }]" @click="model = !model">
      <i v-if="model" class="mdi mdi-check" />
    </span>
    <span><slot /></span>
  </div>
</template>
<script setup>
const model = defineModel()
</script>
