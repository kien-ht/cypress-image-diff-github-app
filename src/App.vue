<template>
  <component :is="layoutMap[layout]">
    <router-view />
  </component>
</template>

<script lang="ts" setup>
import { useAppTheme } from '@/hooks'
import { useMainStore } from './store'
import { layoutMap } from '@/components/layout'

const route = useRoute()
const mainStore = useMainStore()
const { setTheme } = useAppTheme()
setTheme()
mainStore.fetchPublicConfig()

const layout = computed(() => route.meta.layout ?? 'plain')
</script>

<style scoped></style>
