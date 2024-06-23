<template>
  <div class="flex items-end gap-2">
    <span
      :class="[
        'checkbox',
        {
          selected: model,
          disabled
        }
      ]"
      @click="handleClick"
    >
      <i v-if="model" class="mdi mdi-check" />
    </span>
    <span><slot /></span>
  </div>
</template>
<script setup>
const attrs = useAttrs()
const model = defineModel()
const disabled = computed(() =>
  typeof attrs.disabled === 'function' ? attrs.disabled(attrs.row) : attrs.disabled
)
const handleClick = () => {
  if (!disabled.value) {
    model.value = !model.value
  }
}
</script>
