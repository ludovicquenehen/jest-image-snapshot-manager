<template>
  <div class="w-fit">
    <div class="text-xl text-white mb-8">Users</div>
    <div class="flex gap-2 mt-4">
      <input v-model="form.email" placeholder="Email" />
      <select v-model="form.role">
        <option disabled value="">Role</option>
        <option v-for="role in ['ADMIN', 'USER']" :value="role">{{ role }}</option>
      </select>
      <button
        :disabled="Object.values(form).some((e) => e === '')"
        class="button-green w-16"
        @click="useUserStore.add(form)"
      >
        <i class="mdi mdi-send" />
      </button>
    </div>

    <Table :columns="columns" :rows="users" />
  </div>
</template>
<script setup>
import useUserStore from '@/stores/use-user'
import useProjectStore from '@/stores/use-project'
import Table from '@/components/tables/Table.vue'
import Checkbox from '@/components/inputs/Checkbox.vue'
import useUser from '@/stores/use-user'

const users = computed(() =>
  useUserStore.users
    .filter((e) => e.role !== 'SYSTEM')
    .map((e) => ({ ...e, projects: e.projects.map((p) => p.id) }))
    .sort((a, b) => (a.id > b.id ? 1 : -1))
)

const form = ref({
  email: '',
  role: ''
})

const columns = ref([
  {
    label: 'ID',
    class: 'w-8',
    field: 'id'
  },
  {
    label: 'Active',
    class: 'w-16 flex justify-center',
    component: {
      is: Checkbox,
      model: 'active',
      action: async (row) => {
        await useUserStore.activate(row.id)
        await useUserStore.fetch(true)
      }
    }
  },
  {
    label: 'Email',
    class: 'w-64',
    field: 'email'
  },
  {
    label: 'Role',
    class: 'w-32 text-center',
    rowClass: (row) => [
      'w-32 text-center font-semibold',
      { 'text-warning': row.role === 'ADMIN', 'text-blum': row.role === 'USER' }
    ],
    field: 'role'
  },
  {
    label: 'Projects',
    class: 'w-64',
    list: {
      rows: useProjectStore.projects,
      columns: [
        {
          class: 'w-32',
          field: 'label'
        },
        {
          class: 'w-16',
          command: {
            iconClass: 'mdi mdi-location-enter',
            class: 'button-green w-16',
            disabled: (project, user) => user.projects?.includes(project.id),
            action: (project, user) => useUserStore.join(user.id, project.id)
          }
        },
        {
          class: 'w-16',
          command: {
            iconClass: 'mdi mdi-location-exit',
            class: 'button-red w-16',
            disabled: (project, user) => !user.projects?.includes(project.id),
            action: (project, user) => useUserStore.leave(user.id, project.id)
          }
        }
      ]
    }
  },
  {
    class: 'w-32',
    command: {
      iconClass: 'mdi mdi-delete-outline',
      hidden: (row) => useUserStore.user.id === row.id,
      disabled: (row) => row.projects.length,
      class: 'button-red w-32',
      action: (row) => useUserStore.remove(row.id)
    }
  }
])
</script>
