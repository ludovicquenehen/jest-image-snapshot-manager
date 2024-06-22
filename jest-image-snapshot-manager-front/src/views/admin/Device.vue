<template>
  <div class="md:w-fit">
    <div class="text-xl text-white mb-8">Projects</div>
    <div class="flex md:flex-row flex-col gap-2 mt-4">
      <input v-model="form.label" placeholder="Label" />
      <input v-model="form.suffix" placeholder="Suffix" />
      <input v-model="form.height" placeholder="Height" />
      <input v-model="form.width" placeholder="Width" />
      <button
        :disabled="Object.values(form).some((e) => !e)"
        class="button-green md:w-16"
        @click="useDeviceStore.add(form)"
      >
        <i class="mdi mdi-plus" />
      </button>
    </div>
    <Table :columns="columns" :rows="devices" />
  </div>
</template>
<script setup>
import useDeviceStore from '@/stores/use-device-store'
import Table from '@/components/tables/Table.vue'
import useProjectStore from '@/stores/use-project-store'

const devices = computed(() =>
  useDeviceStore.devices.sort((a, b) => a.label.localeCompare(b.label))
)

const form = ref({
  label: '',
  suffix: '',
  height: '',
  width: ''
})

const columns = ref([
  {
    label: 'Label',
    class: 'w-64',
    field: 'label'
  },
  {
    label: 'Suffix',
    class: 'w-16',
    field: 'suffix'
  },
  {
    class: 'w-32',
    label: 'Dimension',
    field: (row) => `${row.height}*${row.width}`
  },
  {
    command: {
      iconClass: 'mdi mdi-delete-outline',
      class: 'button-red w-32',
      action: (row) => useDeviceStore.remove(row.id),
      disabled: (row) =>
        useProjectStore.projects.some((e) => e.devices.map((d) => d.id).includes(row.id))
    }
  }
])
</script>
