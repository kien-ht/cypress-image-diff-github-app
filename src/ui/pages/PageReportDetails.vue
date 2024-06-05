<template>
  <el-breadcrumb
    :separator-icon="ArrowRight"
    class="breadcrumb"
  >
    <el-breadcrumb-item
      :to="{
        name: 'PageDashboard',
        query: { menuItem: DashboardMenu.Projects }
      }"
    >
      Projects
    </el-breadcrumb-item>
    <el-breadcrumb-item>promotion management</el-breadcrumb-item>
  </el-breadcrumb>

  <main class="body">
    <ReportDetailsGeneral />

    <div
      class="body__content-wrapper"
      ref="wrapperRef"
    >
      <ReportDetailsSuites @selected="doSelected" />

      <ReportDetailsBody :suite-id="currentSuiteId" />
    </div>
  </main>
</template>

<script lang="ts" setup>
import { ArrowRight } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { DashboardMenu } from '@/constants'

import { useMainStore } from '@/store'

const mainStore = useMainStore()

const route = useRoute()
mainStore.fetchReport(route.query.artifactsUrl as string)

const currentSuiteId = ref<string>()

function doSelected(id: string) {
  currentSuiteId.value = id
}
const wrapperRef = ref<HTMLElement>()

onMounted(async () => {
  await nextTick()
  wrapperRef.value!.style.height =
    window.innerHeight - wrapperRef.value!.getBoundingClientRect().top + 'px'
})
</script>

<style scoped>
.el-breadcrumb.breadcrumb {
  margin: 1.5rem 2rem 0 2rem;
}

.body {
  padding: 2rem 2rem 0 2rem;
  flex: 1 1 0%;
  display: flex;
  gap: 2rem;
}

.body__content-wrapper {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: minmax(20rem, 1fr) minmax(0, 4fr);
  column-gap: 2rem;
}
</style>
