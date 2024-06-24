<template>
  <div v-if="useUserStore.user" class="flex items-center fixed right-10 top-7 gap-2 bg-current">
    <template v-for="item in items">
      <button
        v-if="!item.admin || useUserStore.isAdmin"
        :class="[
          'w-10 flex justify-center items-center rounded-full',
          {
            'button-white': item.color === 'white',
            'button-warning': item.color === 'warning',
            'button-green': item.color === 'green',
            'button-red': item.color === 'red',
            'button-action': item.color === 'action',
						'fill': item.fill
          }
        ]"
        @click="item.action()"
      >
        <i :class="typeof item.iconClass === 'function' ? item.iconClass() : item.iconClass" />
      </button>
    </template>
  </div>
</template>
<script setup>
import useUserStore from '@/stores/use-user-store'

defineProps({
  items: {
    type: Array,
    default: () => []
  }
})
</script>
