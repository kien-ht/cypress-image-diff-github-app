<template>
  <div class="pipeline-filter">
    <el-select
      v-model="selectedFilters.repo"
      filterable
      :empty-values="[null, undefined]"
      style="width: 240px"
    >
      <el-option
        v-for="project in projects"
        :key="project.value"
        :label="project.label"
        :value="project.value"
      />
    </el-select>

    <el-select
      v-model="selectedFilters.branch"
      filterable
      :empty-values="[null, undefined]"
      style="width: 240px"
    >
      <el-option
        v-for="project in branches"
        :key="project.value"
        :label="project.label"
        :value="project.value"
      />
    </el-select>

    <el-button
      type="primary"
      plain
      @click="onClickSearch"
    >
      Search
    </el-button>
  </div>
</template>

<script lang="ts">
export interface DashboardMenuPipelinesFilterEmits {
  (e: 'searched', filters: PipelineFilter): void
}
</script>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'

import type { SelectOption } from '@/types'
import type { PipelineFilter } from '@commonTypes'

const emit = defineEmits<DashboardMenuPipelinesFilterEmits>()

const route = useRoute()
const router = useRouter()

const selectedFilters = reactive<PipelineFilter>({
  repo: (route.query.repo as string) || '',
  branch: (route.query.branch as string) || ''
})

const projects = ref<SelectOption<string>[]>([])
const branches = ref<SelectOption<string>[]>([])

init()

async function init() {
  await Promise.allSettled([fetchProjects(), fetchBranches()])
}

async function fetchProjects() {
  projects.value = [
    {
      value: '',
      label: 'All projects'
    },
    {
      label: 'My first project',
      value: '3124'
    },
    {
      label: 'My second project',
      value: '31232r'
    }
  ]
}
async function fetchBranches() {
  branches.value = [
    {
      value: '',
      label: 'All branches'
    },
    {
      label: 'demo',
      value: 'demo'
    },
    {
      label: 'test',
      value: 'test'
    }
  ]
}

function onClickSearch() {
  emit('searched', removeEmpty(selectedFilters))
  router.push({
    name: route.name!,
    query: removeEmpty({ ...route.query, ...selectedFilters }),
    replace: true
  })
}

function removeEmpty(source: Record<string, any>) {
  return Object.keys(source).reduce(
    (target, key) => {
      if (
        source[key] !== null &&
        source[key] !== undefined &&
        source[key] !== ''
      ) {
        target[key] = source[key]
      }
      return target
    },
    {} as Record<string, any>
  )
}
</script>

<style scoped>
.pipeline-filter {
  display: flex;
  justify-content: end;
  margin: 1.5rem;
  gap: 1rem;
}
</style>
