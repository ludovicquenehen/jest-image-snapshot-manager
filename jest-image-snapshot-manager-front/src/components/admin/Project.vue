<template>
  <div class="w-fit">
    <div class="text-xl text-white mb-8">Projects</div>
    <div class="flex gap-2 mt-4">
      <input v-model="form.label" placeholder="Label" />
      <input v-model="form.path" placeholder="Project path" />
      <input v-model="form.pathTests" placeholder="Tests path" />
      <button
        :disabled="Object.values(form).some((e) => !e)"
        class="button-green w-16"
        @click="useProjectStore.add(form)"
      >
        <i class="mdi mdi-plus" />
      </button>
    </div>

    <Table :columns="columns" :rows="projects" />
  </div>
</template>
<script setup>
import useProjectStore from '@/stores/use-project'
import useSnapshotStore from '@/stores/use-snapshot'
import Table from '@/components/tables/Table.vue'

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
    label: 'ID',
    class: 'w-8',
    field: 'id'
  },
  {
    label: 'Label',
    class: 'w-64',
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
              useSnapshotStore.fullSnapshots.find(
                (e) => e.projectId === project.id && e.version === version
              ).archived,
            action: (version, project) => archive(project.id, version)
          }
        },
        {
          class: 'w-16',
          command: {
            iconClass: 'mdi mdi-archive-arrow-up-outline',
            class: 'button-red w-16',
            disabled: (version, project) =>
              !useSnapshotStore.fullSnapshots.find(
                (e) => e.projectId === project.id && e.version === version
              ).archived,
            action: (version, project) => unarchive(project.id, version)
          }
        }
      ]
    }
  }
  /*{
    class: 'w-32',
    command: {
      iconClass: 'mdi mdi-delete-outline',
      class: 'button-red w-32',
      action: (row) => useProjectStore.remove(row.id),
    }
  }*/
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
