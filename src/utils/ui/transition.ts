export function startViewTransition(call: () => void) {
  if (document.startViewTransition) {
    nextTick(() => {
      document.startViewTransition(call)
    })
  } else {
    call()
  }
}
