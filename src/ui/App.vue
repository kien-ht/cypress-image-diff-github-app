<template>
  <component :is="layoutMap[layout]">
    <router-view />
  </component>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'

import { useAppTheme } from '@/hooks'
import { useMainStore } from './store'
import { layoutMap } from '@/components/layout'

const route = useRoute()
const mainStore = useMainStore()
const { setTheme } = useAppTheme()
setTheme()
mainStore.fetchPublicConfig()

const layout = computed(() => route.meta.layout ?? 'default-with-header')
</script>

<style scoped></style>
