<template>
  <div>
    <button class="button-white mb-4 w-32" @click="router.push('/')">
      <i class="mr-2 mdi mdi-arrow-left" />
    </button>
    <div class="w-fit">
      <div class="text-xl text-white mb-8">Snapshots</div>
      <Table :columns="columns" :rows="snapshots" />
    </div>
  </div>
</template>
<script setup>
import useSnapshotStore from '@/stores/use-snapshot'
import useUserStore from '@/stores/use-user'
import Table from '@/components/Table.vue'
import useUser from '@/stores/use-user'

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
    label: 'Last version',
    class: 'w-32',
    field: 'last.version'
  },
  {
    label: 'Last iteration',
    class: 'w-32',
    field: 'last.versionIteration'
  },
  {
    label: 'Last run',
    class: 'w-64',
    field: 'createdAt'
  },
  {
    class: 'w-32',
    command: {
      iconClass: 'mdi mdi-history',
      class: 'button-white w-32',
      disabled: (row) =>
        useSnapshotStore.fullSnapshots
          .filter((e) => e.projectId === row.projectId && e.label === row.label)
          .every((e) => e.archived),
      action: (row) => router.push(`/history/${row.id}#full`)
    }
  },
  {
    class: 'w-16',
    hidden: !useUser.isAdmin,
    command: {
      iconClass: 'mdi mdi-archive-arrow-down-outline',
      class: 'button-green w-16',
      disabled: (row) =>
        useSnapshotStore.fullSnapshots
          .filter((e) => e.projectId === row.projectId && e.label === row.label)
          .every((e) => e.archived),
      action: (row) => useSnapshotStore.archive(row)
    }
  },
  {
    class: 'w-16',
    hidden: !useUser.isAdmin,
    command: {
      iconClass: 'mdi mdi-archive-arrow-up-outline',
      class: 'button-red w-16',
      disabled: (row) =>
        useSnapshotStore.fullSnapshots
          .filter((e) => e.projectId === row.projectId && e.label === row.label)
          .some((e) => !e.archived),
      action: (row) => useSnapshotStore.unarchive(row)
    }
  },
  {
    class: 'w-32',
    hidden: !useUser.isAdmin,
    command: {
      iconClass: 'mdi mdi-delete-outline',
      class: 'button-red w-32',
      disabled: (row) =>
        useSnapshotStore.fullSnapshots
          .filter((e) => e.projectId === row.projectId && e.label === row.label)
          .some((e) => e.archived),
      action: (row) => useSnapshotStore.remove(row)
    }
  }
])
</script>
