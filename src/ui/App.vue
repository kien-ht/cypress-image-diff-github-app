<template>
  <router-view></router-view>
</template>

<script lang="ts" setup>
import { useAppTheme } from '@/hooks'
import { useMainStore } from './store'

const mainStore = useMainStore()
const { setTheme } = useAppTheme()
setTheme()
mainStore.fetchPublicConfig()
</script>

<style scoped></style>
