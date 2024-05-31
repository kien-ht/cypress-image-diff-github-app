<template>
  <div></div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAccessToken } from '@/service'
import { useStorage } from '@/hooks'

const [, setToken] = useStorage<string>('token', '')
const route = useRoute()
const router = useRouter()
fetchUserAccessToken()

async function fetchUserAccessToken() {
  try {
    const token = await getAccessToken(route.query.code as string)
    setToken(token)
    router.push({ name: 'PageHome' })
  } catch (err) {
    ElMessage({
      type: 'error',
      message: (err as Error).message
    })
  }
}
</script>

<style scoped></style>
