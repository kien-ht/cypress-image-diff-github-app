export function useRerender() {
  const key = ref(0)

  function rerender() {
    key.value++
  }
  return {
    key,
    rerender
  }
}
