<template>
  <div class="wrapper">
    <h2 class="title">Pipelines</h2>

    <p>Keep track of all the changes that take place in your projects.</p>

    <DashboardMenuPipelinesFilter @searched="doSearched" />

    <div class="pipelines">
      <template
        v-for="pipeline in pipelines"
        :key="pipeline.pipelineId"
      >
        <div class="pipelines-timestamp">
          <span>{{ $G.formatDateTime(pipeline.createdAt) }}</span>
          <el-tag
            type="primary"
            round
          >
            {{ pipeline.author }}
          </el-tag>
        </div>

        <DashboardMenuPipelinesBodyItem :pipeline="pipeline" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CreatedPipeline, PipelineFilter } from '@commonTypes'
import { getPipelines } from '@/service'
import { ElMessage } from 'element-plus'

const pipelines = ref<CreatedPipeline[]>([])

async function doSearched(filters: PipelineFilter) {
  try {
    pipelines.value = await getPipelines(filters)
  } catch (err) {
    ElMessage({ type: 'error', message: (err as Error).message })
  }
}
</script>

<style scoped>
.wrapper {
  display: grid;
  gap: 1rem;
  padding: 0 3rem 3rem 3rem;
  /* border: 1px solid var(--color-border); */
  border-radius: 1rem;
}

.wrapper > .title {
  margin-top: 2rem;
  font-weight: bold;
}

.wrapper > .pipelines {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
}

.wrapper > .pipelines > .pipelines-timestamp {
  padding: 2rem 1rem;
  font-size: 12px;
  white-space: pre-wrap;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;

  color: var(--color-text-secondary);
  border-right: 1px solid var(--color-border);

  position: relative;
}
.wrapper > .pipelines > .pipelines-timestamp:before {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  width: 0.8rem;
  height: 0.8rem;
  background-color: var(--color-primary);
  border-radius: 1rem;
  transform: translate(50%, -50%);
}
.wrapper > .pipelines > .pipelines-timestamp > .el-tag {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
