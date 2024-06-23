<template>
  <input v-model="model" type="range" v-bind="attrs" class="cursor-diff mb-8" />
</template>

<script setup>
const props = defineProps({
  width: {
    type: String
  }
})
const attrs = useAttrs()
const model = defineModel()
</script>
<style scoped>
/*********** Baseline, reset styles ***********/
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type='range']:disabled {
  cursor: not-allowed;
}

input[type='range']:disabled::-webkit-slider-thumb {
  background: lightgray;
}

/* Removes default focus */
input[type='range']:focus {
  outline: none;
}

/******** Chrome, Safari, Opera and Edge Chromium styles ********/
/* slider track */
input[type='range']::-webkit-slider-runnable-track {
  background-color: var(--deep-sky-blue);
  border-radius: 0.5rem;
  height: 2px;
}

/* slider thumb */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  margin-top: -14px; /* Centers thumb on the track */
  background-color: var(--color-background);
  border-radius: 0.5rem;
  border: 2px solid var(--deep-sky-blue);
  height: 30px;
  width: 30px;
}

.cursor-diff {
  width: v-bind(width);
}
</style>
