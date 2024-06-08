import axios from 'axios'

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_PROXY_API}/v1`,
  withCredentials: true
})
axios.defaults.headers.common['Authorization']
axios.defaults.headers.post['Content-Type'] = 'application/json'

instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  function (error) {
    // Do something with request error
    //console.error(error)
    //return Promise.reject(error)
  }
)

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if (response.data?.token?.token) {
      localStorage.setItem('auth_token', response.data?.token?.token)
    }

		if (response.status === 400) {
			return false
		}

    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response.status === 401) {
      window.location = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = instance
export const proxyApi = import.meta.env.VITE_PROXY_API
