import { api } from '@/plugins/axios'
import { useToast } from 'vue-toastification'
import useAppStore from '@/stores/use-app-store'
import useProjectStore from '@/stores/use-project-store'
import useSnapshotStore from '@/stores/use-snapshot-store'

const toast = useToast()

export default reactive({
  users: [],
  user: null,
  get isAdmin() {
    return this.user?.role === 'ADMIN'
  },
  async fetch(force = false) {
    if (this.users.length === 0 || force) {
      try {
        this.users = (await api.get('/users'))?.data || []
      } catch (err) {
        toast.error('Users fetch error')
      }
    }
  },
  async me() {
    this.user = (await api.get('/me'))?.data || null
  },
  async login(form) {
    try {
      useAppStore.loading = true
      if (await api.post('/login', { ...form })) toast.success('Logged in successfully')
      this.me()
      await useProjectStore.fetch(true)
      await useSnapshotStore.fetch(true)
      useAppStore.loading = false
      return true
    } catch (err) {
      toast.error('Login error')
    }
    useAppStore.loading = false
  },
  async logout() {
    try {
      useAppStore.loading = true
      setTimeout(async () => {
        if (await api.get('/logout')) toast.success('Logged out successfully')
        this.user = null
        useAppStore.loading = false
      }, 1000)
    } catch {
      toast.error('Logout error')
    }
  },
  async add(user) {
    try {
      if (await api.put('/user', { ...user })) toast.success('User added successfully')
      await this.fetch(true)
    } catch {
      toast.error('Add user error')
    }
  },
  async update(user) {
    try {
      if (await api.post('/user', { ...user })) toast.success('User updated successfully')
      await this.fetch(true)
    } catch {
      toast.error('Update user error')
    }
  },
  async remove(userId) {
    try {
      if (await api.delete(`/user/${userId}`)) toast.success('User removed successfully')
      await this.fetch(true)
    } catch {
      toast.error('Remove user error')
    }
  },
  async join(userId, projectId) {
    try {
      if (await api.get(`/user/${userId}/join/${projectId}`))
        toast.success('User join project successfully')
      await this.fetch(true)
    } catch {
      toast.error('Join project error')
    }
  },
  async leave(userId, projectId) {
    try {
      if (await api.get(`/user/${userId}/leave/${projectId}`))
        toast.success('User leave project successfully')
      await this.fetch(true)
    } catch {
      toast.error('Leave project error')
    }
  },
  async signIn(form) {
    try {
      useAppStore.loading = true
      setTimeout(async () => {
        if (await api.post('/sign-in', form)) toast.success('Email sent successfully')
        useAppStore.loading = false
      }, 1000)
    } catch {
      toast.error('Error occured during mail sending')
    }
  },
  async confirmAccount(hash) {
    try {
      useAppStore.loading = true
      setTimeout(async () => {
        useAppStore.loading = false
        if (await api.get(`/${hash}`)) toast.success('Account confirmed successfully')
      }, 1000)
    } catch (error) {
      console.log(error)
      toast.error('Account confirmation error')
    }
  },
  async resetPassword(email) {
    try {
      useAppStore.loading = true
      setTimeout(async () => {
        if (await api.post('/reset-password', { email }))
          toast.success('Reset password email sent successfully')
        useAppStore.loading = false
      }, 1000)
    } catch {
      toast.error('Reset password error')
    }
  },
  async changePassword(form) {
    try {
      useAppStore.loading = true
      setTimeout(async () => {
        useAppStore.loading = false
        if (await api.post(`/user/${this.user.id}`, { password: form.new, email: this.user.email }))
          toast.success('Change password successfully')
        await this.logout()
      }, 1000)
    } catch {
      toast.error('Change Password error')
    }
  },
  setPreferences(preferences) {
    localStorage.setItem('preferences', JSON.stringify(preferences))
  },
  getPreferences() {
    return localStorage.getItem('preferences')
      ? JSON.parse(localStorage.getItem('preferences'))
      : null
  }
})
