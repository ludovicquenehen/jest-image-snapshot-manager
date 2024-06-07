const CODES = {
  left: 'ArrowLeft',
  right: 'ArrowRight'
}

export default function useKeyboard(callbacks) {
  onMounted(() => {
    window.addEventListener('keydown', (e) => {
      Object.keys(callbacks).forEach((callback) => {
        if (e.key === CODES[callback]) {
          callbacks[callback]()
        }
      })
    })
  })
}
