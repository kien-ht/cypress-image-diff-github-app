<template>
  <BaseHeader />

  <main class="main-wrapper">
    <el-menu
      :default-active="($route.name as string) || DashboardMenu.Projects"
      class="el-menu-vertical-demo box-shadow-regular"
      @select="(e: string) => $router.push({ name: e })"
    >
      <el-menu-item
        :disabled="!mainStore.projects || mainStore.projects.length === 0"
        :index="DashboardMenu.Pipelines"
      >
        <BaseIcon name="pipeline" />
        <span>Pipelines</span>
      </el-menu-item>
      <el-menu-item :index="DashboardMenu.Projects">
        <BaseIcon name="task" />
        <span>Projects</span>
      </el-menu-item>
      <el-menu-item :index="DashboardMenu.User">
        <BaseIcon name="user" />
        <span>User Profile</span>
      </el-menu-item>
      <el-menu-item :index="DashboardMenu.Settings">
        <BaseIcon name="settings" />
        <span>General Settings</span>
      </el-menu-item>
    </el-menu>

    <div>
      <slot />
    </div>
  </main>
</template>

<script lang="ts" setup>
import { useMainStore } from '@/store'
import { DashboardMenu } from '@/constants'

const mainStore = useMainStore()
mainStore.fetchProjects()
</script>

<style scoped>
main.main-wrapper {
  display: grid;
  grid-template-columns: minmax(20rem, 1fr) minmax(0, 4fr);
  font-size: 16px;
  flex: 1 1 auto;
  padding: 2rem;
  gap: 2rem;
}
.el-menu {
  background-color: var(--color-background-el);
  border-radius: 1rem;
  overflow: hidden;
  border-right: 1.5rem solid var(--color-background-mute);
}
.el-menu-item {
  --el-menu-item-font-size: 16px;

  gap: 1rem;
}
.el-menu-item.is-active {
  background-color: var(--el-color-primary-light-9);
}
</style>
