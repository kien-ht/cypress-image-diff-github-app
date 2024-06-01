<template>
  <header class="header">
    <img
      style="height: 4rem"
      src="@/assets/images/cypress-image-diff-logo.png"
    />

    <h1 style="font-weight: bold">Cypress Image Diff</h1>
  </header>

  <el-menu
    default-active="2"
    class="el-menu-vertical-demo"
  >
    <el-sub-menu index="1">
      <template #title>
        <el-icon><location /></el-icon>
        <span>Navigator One</span>
      </template>
      <el-menu-item-group title="Group One">
        <el-menu-item index="1-1">item one</el-menu-item>
        <el-menu-item index="1-2">item two</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group title="Group Two">
        <el-menu-item index="1-3">item three</el-menu-item>
      </el-menu-item-group>
      <el-sub-menu index="1-4">
        <template #title>item four</template>
        <el-menu-item index="1-4-1">item one</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <el-menu-item index="2">
      <el-icon><icon-menu /></el-icon>
      <span>Navigator Two</span>
    </el-menu-item>
    <el-menu-item
      index="3"
      disabled
    >
      <el-icon><document /></el-icon>
      <span>Navigator Three</span>
    </el-menu-item>
    <el-menu-item index="4">
      <el-icon><setting /></el-icon>
      <span>Navigator Four</span>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
// import { useRoute, useRouter } from 'vue-router'
// import { ElMessage } from 'element-plus'
// import { getUser } from '@/service'
// import { useStorage } from '@/hooks'

// const [, setToken] = useStorage<string>('token', '')
// const route = useRoute()
// const router = useRouter()

// async function fetchUserAccessToken() {
//   try {
//     const token = await getAccessToken(route.query.code as string)
//     setToken(token)
//     router.push({ name: 'PageUser' })
//   } catch (err) {
//     ElMessage({
//       type: 'error',
//       message: (err as Error).message
//     })
//   }
// }
</script>

<style scoped>
.header {
  padding: 2rem 2rem 0.5rem 2rem;

  display: flex;
  gap: 1rem;
  align-items: center;
}
</style>
