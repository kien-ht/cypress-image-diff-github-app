<template>
  <div></div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { signIn, signUp } from '@/service'
import { useMainStore } from '@/store'

const route = useRoute()
const router = useRouter()
const mainStore = useMainStore()

init()

async function init() {
  try {
    if (!route.query.code)
      throw Error(`${route.query.error}: Authorization failed!`)

    if (route.query.state === 'signIn') {
      await signIn(route.query.code as string)
    } else {
      await signUp(route.query.code as string)
    }

    mainStore.hasSignedIn = true
    router.push({ name: 'PageProjects' })
  } catch (err) {
    mainStore.hasSignedIn = false
    ElMessage({
      type: 'error',
      message: (err as Error).message
    })
    router.push({ name: 'PageHome' })
  }
}
</script>

<style scoped></style>
