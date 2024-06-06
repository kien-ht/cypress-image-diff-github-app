<template>
  <div class="wrapper">
    <h2 class="title">Pipelines</h2>

    <p>Keep track of all the changes that take place in your projects.</p>

    <DashboardMenuPipelinesFilter @searched="doSearched" />

    <div class="pipelines">
      <template
        v-for="pipeline in pipelines"
        :key="pipeline.id"
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
import type { Pipeline, PipelineFilter } from '@commonTypes'

const pipelines: Pipeline[] = [
  {
    installationId: 51388066,
    owner: 'kien-ht',
    repo: 'test-github-app',
    sha: 'c100e9a10649a06b5bc22300262b9fe008659a35',
    ref: 'demo',
    pullNumber: 38,
    targetRef: 'test',
    author: 'kien-ht',
    authorAvatar: 'https://avatars.githubusercontent.com/u/71423573?v=4',
    artifactsUrl:
      'https://circleci.com/api/v2/project/circleci/UhkTUvo4ZbS7cgD3wDqaei/GbDbvf1J4wtqsiRrp5B19N/36/artifacts',
    id: '4444444444',
    commitMessage: 'feat: new page',
    createdAt: '2024-06-05T14:25:52.800Z',
    total: 2,
    totalFailed: 1,
    totalPassed: 1
  },
  {
    installationId: 51388066,
    owner: 'kien-ht',
    repo: 'test-github-app',
    sha: 'c100e9a10649a06b5bc22300262b9fe008659a35',
    ref: 'demo',
    pullNumber: 38,
    targetRef: 'test',
    author: 'kien-ht',
    authorAvatar: 'https://avatars.githubusercontent.com/u/71423573?v=4',
    artifactsUrl:
      'https://circleci.com/api/v2/project/circleci/UhkTUvo4ZbS7cgD3wDqaei/GbDbvf1J4wtqsiRrp5B19N/36/artifacts',
    id: '5555555',
    commitMessage: 'feat: new page',
    createdAt: '2024-06-05T14:25:52.800Z',
    total: 3,
    totalFailed: 1,
    totalPassed: 2
  }
]

function doSearched(filters: PipelineFilter) {
  // eslint-disable-next-line no-console
  console.log(filters)
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
