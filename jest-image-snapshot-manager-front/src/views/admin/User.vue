<template>
  <div class="md:w-fit">
    <div class="text-xl text-white mb-8">Users</div>
    <div class="flex items-end gap-8">
      <span class="text-white text-lg self-center font-semibold underline">Invite by link or email</span>
      <span
        class="copy-clipboard flex items-center justify-center text-white px-6 py-4 border-2 border-white rounded-full h-16 w-[550px] cursor-pointer"
        @click="copyToClipboard(`${$baseUrl}/sign-in/${useUserStore.user?.organization}`)"
      >
        <span class="value">{{ `${$baseUrl}/sign-in/${useUserStore.user?.organization}` }}</span>
        <span class="text text-lg font-semibold">Copy invitation link to clipboard</span>
      </span>
      <div class="flex md:flex-row flex-col gap-2 mt-4 md:w-fit w-full">
        <input v-model="form.email" placeholder="Email" />
        <select v-model="form.role">
          <option disabled value="">Role</option>
          <option v-for="role in ['ADMIN', 'USER']" :value="role">{{ role }}</option>
        </select>
        <button
          :disabled="Object.values(form).some((e) => e === '')"
          class="button-green md:w-16"
          @click="useUserStore.add(form)"
        >
          <i class="mdi mdi-send" />
        </button>
      </div>
    </div>
    <Table :columns="columns" :rows="users" />
  </div>
</template>
<script setup>
import useUserStore from '@/stores/use-user-store'
import useProjectStore from '@/stores/use-project-store'
import Table from '@/components/tables/Table.vue'
import Checkbox from '@/components/inputs/Checkbox.vue'
import { useToast } from 'vue-toastification'
import router from '@/router'
const toast = useToast()

const copyToClipboard = async (link) => {
  try {
    await navigator.clipboard.writeText(link)
    toast.success('Copied to clipboard successfully')
  } catch {
    toast.error('Copy to clipboard error')
  }
}

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
    label: 'Active',
    class: 'flex justify-center',
    component: {
      is: Checkbox,
      model: 'active',
      action: async (row) => {
        await useUserStore.update({ ...row, activate: !row.activate })
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
      hideColumns: true,
      hideBorders: true,
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
            class: 'button-green md:w-16 w-32',
            disabled: (project, user) => user.projects?.includes(project.id),
            action: (project, user) => useUserStore.join(user.id, project.id)
          }
        },
        {
          class: 'w-16',
          command: {
            iconClass: 'mdi mdi-location-exit',
            class: 'button-red md:w-16 w-32',
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

<style scoped>
.copy-clipboard .text {
  display: block;
}

.copy-clipboard .value {
  display: none;
}

.copy-clipboard:hover .text {
  display: none;
}

.copy-clipboard:hover .value {
  display: block;
}
</style>
