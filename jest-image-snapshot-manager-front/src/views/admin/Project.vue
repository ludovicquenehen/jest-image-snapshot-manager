<template>
  <div class="md:w-fit">
    <div class="text-xl text-white mb-8">Projects</div>
    <div class="flex md:flex-row flex-col gap-2 mt-4">
      <input v-model="form.label" placeholder="Label" />
      <input v-model="form.path" placeholder="Project path" />
      <input v-model="form.pathTests" placeholder="Tests path" />
      <button
        :disabled="Object.values(form).some((e) => !e)"
        class="button-green md:w-16"
        @click="useProjectStore.add(form)"
      >
        <i class="mdi mdi-plus" />
      </button>
    </div>
    <Table :columns="columns" :rows="projects" />
  </div>
</template>
<script setup>
import useProjectStore from '@/stores/use-project-store'
import useSnapshotStore from '@/stores/use-snapshot-store'
import Table from '@/components/tables/Table.vue'
import useDeviceStore from '@/stores/use-device-store'

const projects = computed(() =>
  useProjectStore.projects.sort((a, b) => a.label.localeCompare(b.label))
)
const form = ref({
  label: '',
  path: '',
  pathTests: ''
})

const columns = ref([
  {
    label: 'Label',
    class: 'w-32',
    field: 'label'
  },
  {
    label: 'Path',
    class: 'w-64 text-center',
    rowClass: 'w-64 text-center font-semibold',
    field: 'path'
  },
  {
    label: 'Path tests',
    class: 'w-64 text-center',
    rowClass: 'w-64 text-center font-semibold',
    field: 'pathTests'
  },
  {
    label: 'Version archive',
    class: 'w-64',
    list: {
      hideColumns: true,
      hideBorders: true,
      rows: (project) => [
        ...new Set(
          useSnapshotStore.fullSnapshots
            .filter((e) => e.projectId === project.id)
            .map((e) => e.version)
        )
      ],
      columns: [
        {
          class: 'w-32'
        },
        {
          class: 'w-16',
          command: {
            iconClass: 'mdi mdi-archive-arrow-down-outline',
            class: 'button-green w-16',
            disabled: (version, project) =>
              useSnapshotStore.fullSnapshots
                .filter((e) => e.projectId === project.id && e.version === version)
                .every((e) => e.archived),
            action: (version, project) => archive(project.id, version)
          }
        },
        {
          class: 'w-16',
          command: {
            iconClass: 'mdi mdi-archive-arrow-up-outline',
            class: 'button-red w-16',
            disabled: (version, project) =>
              useSnapshotStore.fullSnapshots
                .filter((e) => e.projectId === project.id && e.version === version)
                .some((e) => !e.archived),
            action: (version, project) => unarchive(project.id, version)
          }
        }
      ]
    }
  },
  {
    label: 'Devices',
    class: 'w-64',
    list: {
      hideColumns: true,
      hideBorders: true,
      rows: () => useDeviceStore.devices,
      columns: [
        {
          class: 'w-32',
          field: 'label'
        },
        {
          class: 'w-16',
          command: {
            iconClass: 'mdi mdi-card',
            class: 'button-green w-16',
            disabled: (device, project) => project.devices.map((e) => e.id).includes(device.id),
            action: (device, project) => useDeviceStore.assign(device.id, project.id)
          }
        },
        {
          class: 'w-16',
          command: {
            iconClass: 'mdi mdi-card-off',
            class: 'button-red w-16',
            disabled: (device, project) => !project.devices.map((e) => e.id).includes(device.id),
            action: (device, project) => useDeviceStore.unassign(device.id, project.id)
          }
        }
      ]
    }
  },
  {
    class: 'w-32',
    command: {
      iconClass: 'mdi mdi-delete-outline',
      class: 'button-red w-32',
      action: (row) => useProjectStore.remove(row.id),
      disabled: (row) =>
        useSnapshotStore.fullSnapshots
          .filter((e) => e.projectId === row.id)
          .some((e) => !e.archived)
    }
  }
])

const archive = async (projectId, versionId) => {
  await useProjectStore.archive(projectId, versionId)
  await useSnapshotStore.fetch(true)
}

const unarchive = async (projectId, versionId) => {
  await useProjectStore.unarchive(projectId, versionId)
  useSnapshotStore.fetch(true)
}
</script>
