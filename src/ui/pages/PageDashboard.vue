<template>
  <main class="main-wrapper">
    <el-menu
      :default-active="
        ($route.query.menuItem as string) || DashboardMenu.Projects
      "
      class="el-menu-vertical-demo box-shadow-regular"
      @select="
        (e) =>
          $router.push({
            name: 'PageDashboard',
            query: { menuItem: e },
            replace: true
          })
      "
    >
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
      <component :is="map[route.query.menuItem as DashboardMenu]" />
    </div>
  </main>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'

import { DashboardMenu } from '@/constants'
import DashboardMenuProjects from '@/components/feature/DashboardMenuProjects.vue'
import DashboardMenuUser from '@/components/feature/DashboardMenuUser.vue'
import DashboardMenuSettings from '@/components/feature/DashboardMenuSettings.vue'

const route = useRoute()

const map: Record<DashboardMenu, Component> = {
  [DashboardMenu.Projects]: DashboardMenuProjects,
  [DashboardMenu.User]: DashboardMenuUser,
  [DashboardMenu.Settings]: DashboardMenuSettings
}
</script>

<style scoped>
main.main-wrapper {
  display: grid;
  grid-template-columns: minmax(20rem, 1fr) minmax(0, 4fr);
  font-size: 16px;
  flex: 1 1 auto;
  padding: 2rem;
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
