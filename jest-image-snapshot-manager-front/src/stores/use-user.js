import { api } from '@/plugins/axios'
import { useToast } from 'vue-toastification'
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
      } catch (err) {}
    }
  },
  async me() {
    this.user = (await api.get('/me'))?.data || null
  },
	async activate(id) {
    try {
      await api.get(`/activate/${id}`)
      toast.success('User activated successfully')
    } catch {
      toast.error('User activation error')
    }
  },
  async login(form) {
    try {
      await api.post('/login', { ...form })
      toast.success('Logged in successfully')
      this.me()
    } catch {
      toast.error('Login error')
    }
  },
  async logout() {
    try {
      await api.get('/logout')
      toast.success('Logged out successfully')
      this.user = null
    } catch {
      toast.error('Logout error')
    }
  },
  async add(user) {
    try {
      await api.put('/user', { ...user })
      toast.success('User added successfully')
      await this.fetch(true)
    } catch {
      toast.error('Add user error')
    }
  },
  async remove(userId) {
    try {
      await api.delete(`/user/${userId}`)
      toast.success('User removed successfully')
      await this.fetch(true)
    } catch {
      toast.error('Remove user error')
    }
  },
  async join(userId, projectId) {
    try {
      await api.get(`/user/${userId}/join/${projectId}`)
      toast.success('User join project successfully')
      await this.fetch(true)
    } catch {
      toast.error('Join project error')
    }
  },
  async leave(userId, projectId) {
    try {
      await api.get(`/user/${userId}/leave/${projectId}`)
      toast.success('User leave project successfully')
      await this.fetch(true)
    } catch {
      toast.error('Leave project error')
    }
  },
  async signIn(form) {
    try {
      await api.post('/sign-in', form)
    } catch {
      toast.error('Error occured during mail sending')
    }
  },
	async confirmAccount(hash) {
		try {
      await api.get(`/${hash}`)
			toast.success('Account confirmed successfully')
    } catch(error) {
			console.log(error)
      toast.error('Account confirmation error')
    }
	},
	async resetPassword(email) {
    try {
      await api.post('/reset-password', { email })
      toast.success('Reset password successfully')
    } catch {
      toast.error('Reset password error')
    }
  },
  async changePassword(form) {
    try {
      await api.post(`/user/${this.user.id}`, { password: form.new, email: this.user.email })
      await this.logout()
      toast.success('Change password successfully')
    } catch {
      toast.error('Change Password error')
    }
  },
  setPreferences(preferences) {
    localStorage.setItem('preferences', JSON.stringify(preferences))
  },
  getPreferences(preferences) {
    return localStorage.getItem('preferences')
      ? JSON.parse(localStorage.getItem('preferences'))
      : null
  }
})
