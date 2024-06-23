<template>
  <div>
    <div class="text-xl text-white mb-8">Runners</div>
    <div class="flex md:flex-row flex-col md:items-end gap-2">
      <select v-model="project">
        <option disabled value="">Project</option>
        <option v-for="project in projectList" :value="project.id">{{ project.label }}</option>
      </select>
      <select v-model="version">
        <option disabled value="">Version</option>
        <option v-for="version in versionList" :value="version">{{ version }}</option>
      </select>
      <input v-model="newVersion" placeholder="New version" />
      <button :disabled="disabledCommit" class="button-white md:w-16" @click="run('commit')">
        <i class="mdi mdi-source-pull" />
      </button>
      <button :disabled="disabledMerge" class="button-green md:w-16" @click="run('merge')">
        <i class="mdi mdi-call-merge" />
      </button>
      <span v-if="currentProject?.commitInProgress || disabled" class="text-red text-semibold"
        >Runner in progress</span
      >
    </div>
  </div>
</template>
<script setup>
import { api } from '@/plugins/axios'
import useProjectStore from '@/stores/use-project-store'
import useSnapshotStore from '@/stores/use-snapshot-store'

const newVersion = ref('')
const project = ref('')
const version = ref('')
const projectList = computed(() => useProjectStore.projects)
const currentProject = computed(() => useProjectStore.projects.find((e) => e.id === project.value))
const versionList = computed(() => {
  return [
    ...new Set(
      useSnapshotStore.snapshots
        .filter((e) => e.projectId === project.value)
        .map((e) => e.version)
    )
  ]
})

const disabled = ref(false)
const disabledCommit = computed(
  () =>
    !project.value ||
    (!version.value && !newVersion.value) ||
    !!project.value?.commitInProgress ||
    disabled.value ||
    useSnapshotStore.snapshots.some(
      (e) =>
        e.projectId === project.value &&
        ['MERGE', 'CLOSE'].includes(e.status)
    )
)
const disabledMerge = computed(
  () =>
    !project.value ||
    !version.value ||
    !!project.value?.commitInProgress ||
    disabled.value ||
    !useSnapshotStore.snapshots.some(
      (e) =>
        e.projectId === project.value &&
        ['APPROVE', 'DECLINE'].includes(e.status)
    )
)

const run = async (runner) => {
  const currentProjectVersion =
    runner === 'commit' ? newVersion.value || version.value : version.value
  disabled.value = true
  await api.get(`/run/${runner}/${project.value}/${currentProjectVersion}`)
  disabled.value = false
}
</script>
