<template>
  <div class="pipeline-filter">
    <el-select
      v-model="selectedFilters.repo"
      filterable
      :empty-values="[null, undefined]"
      style="width: 240px"
    >
      <el-option
        v-for="option in projectOptions"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>

    <el-select
      v-model="selectedFilters.branch"
      filterable
      :empty-values="[null, undefined]"
      style="width: 240px"
    >
      <el-option
        v-for="option in branchOptions"
        :key="option.value"
        :label="option.label"
        :value="option.value"
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
import { useMainStore } from '@/store'

const emit = defineEmits<DashboardMenuPipelinesFilterEmits>()

const route = useRoute()
const router = useRouter()
const mainStore = useMainStore()

const branchOptions = ref<SelectOption<string>[]>([])
const projectOptions = computed(() =>
  mainStore.projects?.map((p) => ({ label: p.name, value: p.projectId }))
)

const selectedFilters = reactive<PipelineFilter>({
  repo: '',
  branch: ''
})

init()

async function init() {
  await Promise.allSettled([fetchBranches(), mainStore.fetchProjects()])
  setDefaultSelection()
}

async function fetchBranches() {
  branchOptions.value = [
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
  const filters = removeEmpty(selectedFilters)
  emit('searched', filters)
  router.push({ name: route.name!, query: filters, replace: true })
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

function setDefaultSelection() {
  selectedFilters.repo =
    (route.query.repo as string) || projectOptions.value![0]?.value
  selectedFilters.branch =
    (route.query.branch as string) || branchOptions.value[0]?.value
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
