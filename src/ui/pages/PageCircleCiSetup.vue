<template>
  <div>Circle CI setup</div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { establishUserAccess } from '@/service'
import { useMainStore } from '@/store'

const route = useRoute()
const router = useRouter()
const mainStore = useMainStore()

init()

async function init() {
  try {
    await establishUserAccess(route.query.code as string)
    mainStore.hasLoggedIn = true
    router.push({ name: 'PageHome' })
  } catch (err) {
    mainStore.hasLoggedIn = false
    ElMessage({
      type: 'error',
      message: (err as Error).message
    })
  }
}
</script>

<style scoped></style>
