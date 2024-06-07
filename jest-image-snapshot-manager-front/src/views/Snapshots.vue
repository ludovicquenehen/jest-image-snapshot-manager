<template>
  <div>
    <button class="button-white mb-4 w-32" @click="router.push('/')">
      <i class="mr-2 mdi mdi-arrow-left" />
    </button>
    <div class="w-fit">
      <div class="text-xl text-white mb-8">Snapshots</div>

      <div class="flex gap-4 p-4 pr-8 border-b-2 border-current">
        <span class="w-8">ID</span>
        <span class="w-64">Label</span>
        <span class="w-32">Last version</span>
        <span class="w-32">Last iteration</span>
        <span class="w-64">Last run</span>
        <span class="w-32"></span>
      </div>
      <div v-for="snapshot in snapshots" class="text-white p-4 border-b-2 border-current">
        <div class="flex gap-4 items-center">
          <span class="w-8">{{ snapshot.id }}</span>
          <span class="w-64">{{ snapshot.label }}</span>
          <span class="w-32">{{ snapshot.last.version }}</span>
          <span class="w-32">{{ snapshot.last.versionIteration }}</span>
          <span class="w-64">{{ snapshot.last.createdAt }}</span>
          <span class="flex items-center gap-2">
            <button
              :disabled="
                useSnapshotStore.fullSnapshots
                  .filter((e) => e.projectId === snapshot.projectId && e.label === snapshot.label)
                  .every((e) => e.archived)
              "
              class="button-white w-32"
              @click="router.push(`/history/${snapshot.id}#full`)"
            >
              <i class="mdi mdi-history" />
            </button>
            <template v-if="useUserStore.isAdmin">
              <button
                :disabled="
                  useSnapshotStore.fullSnapshots
                    .filter((e) => e.projectId === snapshot.projectId && e.label === snapshot.label)
                    .every((e) => e.archived)
                "
                class="button-red w-16"
                @click="useSnapshotStore.archive(snapshot)"
              >
                <i class="mdi mdi-archive-arrow-down-outline" />
              </button>
              <button
                :disabled="
                  useSnapshotStore.fullSnapshots
                    .filter((e) => e.projectId === snapshot.projectId && e.label === snapshot.label)
                    .some((e) => !e.archived)
                "
                class="button-warning w-16"
                @click="useSnapshotStore.unarchive(snapshot)"
              >
                <i class="mdi mdi-archive-arrow-up-outline" />
              </button>
              <button
                :disabled="
                  useSnapshotStore.fullSnapshots
                    .filter((e) => e.projectId === snapshot.projectId && e.label === snapshot.label)
                    .some((e) => !e.archived)
                "
                class="button-red w-32"
                @click="useSnapshotStore.remove(snapshot)"
              >
                <i class="mdi mdi-delete-outline" />
              </button>
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import useSnapshotStore from '@/stores/use-snapshot'
import useUserStore from '@/stores/use-user'

const router = useRouter()

const snapshots = computed(() => {
  const reversed = [...useSnapshotStore.fullSnapshots]
  reversed.reverse()
  return useSnapshotStore.fullSnapshots
    .map((e) => ({
      ...e,
      last: reversed.find((l) => l.label === e.label)
    }))
    .filter((e) => e.truth && (!e.archived || useUserStore.isAdmin))
    .sort((a, b) => (a.id > b.id ? -1 : 1))
})
</script>
