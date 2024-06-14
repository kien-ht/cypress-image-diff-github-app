<template>
  <el-breadcrumb
    :separator-icon="ArrowRight"
    class="breadcrumb"
  >
    <el-breadcrumb-item :to="{ name: 'PagePipelines' }">
      All Pipelines
    </el-breadcrumb-item>
    <el-breadcrumb-item>{{ pipeline?.commitMessage }}</el-breadcrumb-item>
  </el-breadcrumb>

  <main class="body">
    <ReportDetailsGeneral :pipeline="pipeline" />

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
import { ElMessage } from 'element-plus'

import { getPipelineByPipelineId } from '@/service'
import { useMainStore } from '@/store'
import type { ResolvedPipeline } from '@commonTypes'

const mainStore = useMainStore()

const route = useRoute()

const currentSuiteId = ref<string>()

function doSelected(id: string) {
  currentSuiteId.value = id
}
const wrapperRef = ref<HTMLElement>()
const pipeline = ref<ResolvedPipeline>()

onMounted(async () => {
  await nextTick()
  wrapperRef.value!.style.height =
    window.innerHeight - wrapperRef.value!.getBoundingClientRect().top + 'px'
})

fetchPipeline()

async function fetchPipeline() {
  mainStore.isLoadingReport = true
  try {
    const res = await getPipelineByPipelineId(route.params.pipelineId as string)
    pipeline.value = res
    mainStore.report = res.report
  } catch (err) {
    ElMessage({ type: 'error', message: (err as Error).message })
  }
  mainStore.isLoadingReport = false
}
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
