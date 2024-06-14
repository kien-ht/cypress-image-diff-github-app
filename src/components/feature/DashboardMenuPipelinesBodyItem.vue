<template>
  <div class="pipelines-body box-shadow-regular">
    <div class="title-box">
      <router-link
        :to="{
          name: 'PageReportDetails',
          params: { pipelineId: props.pipeline.pipelineId }
        }"
      >
        {{ props.pipeline.commitMessage }}
      </router-link>

      <div class="github">
        <img
          src="@/assets/images/github.png"
          style="width: 20px"
        />
        <span>
          {{ props.pipeline.repo }}
        </span>

        <BaseIcon
          name="branch"
          style="margin-left: 1rem"
        />
        <span>{{ props.pipeline.branch }}</span>
      </div>
    </div>

    <div
      v-if="props.pipeline.total"
      class="statistic-box"
    >
      <div class="progress__statistics">
        <div
          class="progress__statistics-cell"
          :style="{
            color: props.pipeline.totalPassed
              ? 'var(--color-success)'
              : 'var(--color-text-secondary)'
          }"
        >
          <el-progress
            class="custom-el-progress-reverse"
            :percentage="passPercentage"
            :show-text="false"
            color="var(--color-success)"
          />
          <span style="width: 80px; font-weight: bold">
            {{ props.pipeline.totalPassed }}
            <template v-if="props.pipeline.totalPassed === 1"> Pass </template>
            <template v-else>Passes</template>
          </span>
        </div>
        <div
          class="progress__statistics-cell"
          :style="{
            color: props.pipeline.totalFailed
              ? 'var(--color-danger)'
              : 'var(--color-text-secondary)'
          }"
        >
          <el-progress
            class="custom-el-progress-reverse"
            :percentage="failPercentage"
            :show-text="false"
            color="var(--color-danger)"
          />
          <span style="width: 80px; font-weight: bold">
            {{ props.pipeline.totalFailed }}
            <template v-if="props.pipeline.totalFailed === 1"> Fail </template>
            <template v-else>Fails</template>
          </span>
        </div>
      </div>

      <el-progress
        type="dashboard"
        :percentage="passPercentage"
        :color="[
          { color: 'var(--color-danger)', percentage: 50 },
          { color: 'var(--color-warning)', percentage: 90 },
          { color: 'var(--color-success)', percentage: 100 }
        ]"
        :width="50"
      >
        <span style="color: var(--color-text-secondary)"
          >{{ passPercentage.toFixed() }}%</span
        >
      </el-progress>
    </div>
  </div>
</template>

<script lang="ts">
export interface DashboardMenuPipelinesBodyItemProps {
  pipeline: CreatedPipeline
}
</script>

<script lang="ts" setup>
import type { CreatedPipeline } from '@commonTypes'

const props = defineProps<DashboardMenuPipelinesBodyItemProps>()

const passPercentage = computed(() => {
  return (100 * props.pipeline.totalPassed!) / props.pipeline.total!
})
const failPercentage = computed(() => {
  return (100 * props.pipeline.totalFailed!) / props.pipeline.total!
})
</script>

<style scoped>
.pipelines-body {
  padding: 1.5rem 2rem;
  background-color: var(--color-background-el);
  border-radius: 1rem;
  margin: 1.5rem;

  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--color-text-secondary);
}
.pipelines-body > .title-box {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}
.pipelines-body > .title-box > .github {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.pipelines-body > .statistic-box {
  width: 30rem;
  font-size: 14px;
  display: flex;
  gap: 1rem;
  align-items: center;
}
.pipelines-body .el-progress :deep(.el-progress__text) {
  font-size: 1.2rem !important;
}
.pipelines-body .el-progress :deep(.el-progress-circle__track) {
  stroke: var(--color-background-danger-soft);
  opacity: 0.3;
}
.pipelines-body .progress__statistics {
  flex: 1 1 auto;
}
.pipelines-body .progress__statistics-cell {
  display: flex;
  gap: 1rem;
}
.pipelines-body .progress__statistics-cell .el-progress {
  flex: 1 1 auto;
}
.pipelines-body .custom-el-progress-reverse :deep(.el-progress-bar__inner) {
  left: unset;
  right: 0;
}
.pipelines-body .custom-el-progress-reverse :deep(.el-progress-bar__outer) {
  background-color: transparent;
}
</style>
