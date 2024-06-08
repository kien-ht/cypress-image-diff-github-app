<template>
  <header class="header">
    <img
      style="height: 4rem"
      src="@/assets/images/cypress-image-diff-logo.png"
    />

    <h1 style="font-weight: bold; flex: 1 1 auto">Cypress Image Diff</h1>

    <router-link
      v-if="$route.name !== 'PageUser'"
      :to="{ name: 'PageUser' }"
      class="user-profile"
    >
      <span>{{ mainStore.user?.githubName }}</span>
      <el-avatar
        :size="40"
        :src="mainStore.user?.githubAvatar"
      />
    </router-link>
  </header>
</template>

<script lang="ts" setup>
import { useMainStore } from '@/store'

const mainStore = useMainStore()
</script>

<style scoped>
.header {
  padding: 1.5rem 2rem;

  display: flex;
  gap: 1rem;
  align-items: center;

  border-bottom: 2px solid var(--color-border);
}
.header > .user-profile {
  display: flex;
  gap: 1rem;
  align-items: center;
}
</style>
