<template>
  <div></div>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { signIn, signUp } from '@/service'

const route = useRoute()
const router = useRouter()

init()

async function init() {
  try {
    if (!route.query.code)
      throw Error(`${route.query.error}: Authorization failed!`)

    const [authType, returnTo] = (route.query.state as string).split(',')

    if (authType === 'signIn') {
      await signIn(route.query.code as string)
    } else {
      await signUp(route.query.code as string)
    }

    if (returnTo) {
      router.push({ path: returnTo, replace: true })
    } else {
      router.push({ name: 'PageProjects', replace: true })
    }
  } catch (err) {
    ElMessage({
      type: 'error',
      message: (err as Error).message
    })
    router.push({ name: 'PageHome' })
  }
}
</script>

<style scoped></style>
