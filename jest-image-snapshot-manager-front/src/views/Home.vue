<template>
  <div class="pt-4">
    <div class="flex items-center flex-col border-2 border-current rounded-xl w-32">
      <span class="text-plum font-semibold">
        REQUEST {{ useSnapshotsStore.snapshots.filter((s) => s.status === 'REQUEST').length }}
      </span>
      <span class="text-warning font-semibold">
        PENDING
        {{
          useSnapshotsStore.snapshots.filter((s) => ['APPROVE', 'DECLINE'].includes(s.status))
            .length
        }}
      </span>
      <span class="text-green font-semibold">
        MERGED {{ useSnapshotsStore.snapshots.filter((s) => s.status === 'MERGE').length }}
      </span>
      <span class="text-red font-semibold">
        CLOSED {{ useSnapshotsStore.snapshots.filter((s) => s.status === 'CLOSE').length }}
      </span>
    </div>
    <div class="flex flex-wrap gap-4 mt-8">
      <div
        v-for="project in projects"
        class="flex flex-col gap-4 border-2 border-current w-64 px-12 py-4 rounded-xl"
      >
        <span class="text-2xl text-white font-semibold text-center underline">
          {{ project.label }}
        </span>
        <div class="flex gap-2 items-center">
          <span class="text-lg text-white font-semibold">Versions:</span>
          <span>
            {{
              Math.max(
                ...useSnapshotsStore.snapshots
                  .filter((e) => e.projectId === project.id)
                  .map((e) => e.version)
              )
            }}
          </span>
        </div>
        <span class="text-lg text-white font-semibold">Status</span>
        <div class="flex flex-col gap-4 ml-6">
          <div class="flex items-center gap-4">
            <span class="w-32 font-semibold">REQUEST</span>
            <button :disabled="!project.request" class="button-white w-16 text-center fill">
              {{ project.request }}
            </button>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-32 font-semibold">PENDING</span>
            <button :disabled="!project.pending" class="button-warning w-16 text-center fill">
              {{ project.pending }}
            </button>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-32 font-semibold">MERGED</span>
            <button :disabled="!project.merged" class="button-green w-16 text-center fill">
              {{ project.merged }}
            </button>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-32 font-semibold">CLOSED</span>
            <button :disabled="!project.closed" class="button-red w-16 text-center fill">
              {{ project.closed }}
            </button>
          </div>
        </div>
        <span class="text-lg text-white font-semibold">Validators</span>
        <div
          v-for="user in useUserStore.users.filter(
            (e) => e.projects.some((p) => p.id === project.id) && e.role !== 'ADMIN'
          )"
          class="flex flex-col ml-6"
        >
          {{ user.email }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import useProjectStore from '@/stores/use-project-store'
import useUserStore from '@/stores/use-user-store'
import useSnapshotsStore from '@/stores/use-snapshot-store'

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
