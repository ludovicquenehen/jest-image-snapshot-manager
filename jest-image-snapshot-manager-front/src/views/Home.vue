<template>
  <div v-if="useSnapshotsStore.snapshots.length > 0" class="pt-4">
    <div class="flex items-center flex-col border-2 border-current rounded-xl w-32">
      <div class="text-xl text-white">All statistics</div>
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
          <span class="text-lg text-white font-semibold">Last versions:</span>
          <span>
            {{
              useSnapshotsStore.snapshots
                .filter((e) => e.projectId === project.id)
                .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0]?.version || 'N/A'
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
  <div v-else-if="!useUserStore.isAdmin" class="flex flex-col text-center gap-8 mt-28">
    <i class="mdi mdi-emoticon-sad text-9xl text-orange-500" />
    <span class="text-5xl text-bold">Sorry...</span>
    <span class="text-2xl font-semibold">
      You must contact your organization admin to add you to a project or run a first test
    </span>
    <button class="button-white w-48 mx-auto">
      <a href="mailto:admin@admin.com">Contact admin</a>
    </button>
  </div>
  <div v-else class="flex flex-col text-center gap-8 mt-28">
    <i class="mdi mdi-check-circle text-9xl text-green-500" />
    <span class="text-5xl text-bold">Welcome !</span>
    <span class="text-2xl font-semibold">
      You must configure a project and run a first test to start
    </span>
    <div class="flex md:flex-row flex-col justify-center items-center gap-2">
      <button class="button-white w-48" @click="router.push('/admin/project')">
        Create first project
      </button>
      <button class="button-white w-48" @click="router.push('/admin/runner')">
        Run first test
      </button>
    </div>
  </div>
</template>
<script setup>
import useProjectStore from '@/stores/use-project-store'
import useUserStore from '@/stores/use-user-store'
import useSnapshotsStore from '@/stores/use-snapshot-store'

const router = useRouter()
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
