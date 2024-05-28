<template>
  <router-view></router-view>
</template>

<script lang="ts" setup>
import { useAppTheme } from '@/hooks'

const { setTheme } = useAppTheme()
setTheme()
</script>

<style scoped></style>
