<template>
  <div class="flex flex-wrap gap-4 p-16">
    <div
      v-for="project in projects"
      class="flex flex-col gap-4 border-2 border-current w-64 px-16 py-8 rounded-xl"
    >
      <span class="text-2xl text-white font-semibold text-center">{{ project.label }}</span>
      <div class="flex items-center gap-4">
        <span class="w-32">REQUEST</span>
        <button :disabled="!project.request" class="button-white w-16 text-center fill">{{ project.request }}</button>
      </div>
      <div class="flex items-center gap-4">
        <span class="w-32">PENDING</span>
        <button :disabled="!project.pending" class="button-warning w-16 text-center fill">{{ project.pending }}</button>
      </div>
      <div class="flex items-center gap-4">
        <span class="w-32">MERGED</span>
        <button :disabled="!project.merged" class="button-green w-16 text-center fill">{{ project.merged }}</button>
      </div>
      <div class="flex items-center gap-4">
        <span class="w-32">CLOSED</span>
        <button :disabled="!project.closed" class="button-red w-16 text-center fill">{{ project.closed }}</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import useProjectStore from '@/stores/use-project'
import useSnapshotsStore from '@/stores/use-snapshot'

const projects = computed(() =>
  useProjectStore.projects.map((e) => ({
    ...e,
    request: useSnapshotsStore.snapshots.filter(
      (s) => s.projectId === e.id && s.status === 'REQUEST'
    ).length,
    pending: useSnapshotsStore.snapshots.filter(
      (s) => s.projectId === e.id && ['APPROVE', 'DECLINE'].includes(s.status)
    ).length,
    merged: useSnapshotsStore.snapshots.filter((s) => s.projectId === e.id && s.status === 'MERGE')
      .length,
    closed: useSnapshotsStore.snapshots.filter((s) => s.projectId === e.id && s.status === 'CLOSE')
      .length
  }))
)
</script>
<style></style>
