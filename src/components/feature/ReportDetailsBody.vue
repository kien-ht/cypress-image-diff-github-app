<template>
  <el-table
    v-loading="mainStore.isLoadingReport"
    style="scroll-behavior: auto; height: auto"
    :data="suite?.tests ?? []"
    default-expand-all
    :row-key="(row: ResolvedTest) => row.name"
  >
    <el-table-column
      type="index"
      width="1"
    >
      <template #default="{ row }">
        <div
          :class="{
            'row-selected': mainStore.selectedTestsFlattenMap.get(
              row.baselinePath
            )
          }"
        />
      </template>
    </el-table-column>

    <el-table-column type="expand">
      <template #default="{ row }">
        <ReportDetailsBodyExpand
          class="screenshot-wrapper-bg"
          :test="row"
        />
      </template>
    </el-table-column>

    <el-table-column
      label="Test"
      property="name"
    />

    <el-table-column
      label="Status"
      width="100"
      :filters="fitlerStatuses"
      :filter-method="
        (value: TestStatus, row: ResolvedTest) => row.status === value
      "
    >
      <template #default="{ row }">
        <el-tag
          v-if="row.failed"
          type="danger"
        >
          Fail
        </el-tag>
        <el-tag
          v-else
          type="success"
        >
          Pass
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column
      label="Actual"
      width="100"
    >
      <template #default="{ row }">
        <span>{{ (row.percentage * 100).toFixed(2) }}%</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Failure Threshold"
      width="140"
    >
      <template #default="{ row }">
        <span>{{ (row.failureThreshold * 100).toFixed(2) }}%</span>
      </template>
    </el-table-column>

    <el-table-column class-name="min-content">
      <template #header>
        <div
          v-if="mainStore.selectedTestsFlatten.length"
          class="actions"
        >
          <i v-if="mainStore.selectedTestsFlatten.length === 1"
            >{{ mainStore.selectedTestsFlatten.length }} test selected
          </i>
          <i v-else
            >{{ mainStore.selectedTestsFlatten.length }} tests selected
          </i>
          <el-button
            size="small"
            type="success"
            @click="isDialogApprovalListVisible = true"
          >
            <span>See Approval List</span>
          </el-button>
        </div>

        <div
          v-else
          class="actions"
        >
          <i>No tests selected</i>
          <el-button
            size="small"
            type="success"
            disabled
          >
            <span>See Approval List</span>
          </el-button>
        </div>
      </template>
      <template #default="{ row }">
        <el-button
          size="small"
          type="primary"
          plain
          @click="dialogViewComparisonRef!.open(row)"
        >
          <BaseIcon name="inspect" />
          <span style="margin-left: 0.3rem">Inspect</span>
        </el-button>
        <el-button
          v-if="mainStore.selectedTestsFlattenMap.get(row.baselinePath)"
          size="small"
          type="danger"
          @click="onClickDeselect(row)"
        >
          <BaseIcon name="minus" />
          <span style="margin-left: 0.3rem; min-width: 5rem">Deselect</span>
        </el-button>
        <el-button
          v-else
          :loading="isSelecting === row.name"
          size="small"
          type="success"
          @click="onClickSelect(row)"
        >
          <BaseIcon name="plus" />
          <span style="margin-left: 0.3rem; min-width: 5rem">Select</span>
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <DialogViewComparison
    ref="dialogViewComparisonRef"
    @selection-toggled="doSelectionToggled"
  />

  <DialogApprovalList
    v-model:show="isDialogApprovalListVisible"
    @deselected="onClickDeselect"
  />
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { useMainStore } from '@/store'
import type { default as DialogViewComparison } from './DialogViewComparison.vue'
import { TestStatus, ResolvedTest } from '@commonTypes'
import { addToStagedChanges } from '@/service'

const props = defineProps<{
  suiteId?: string
}>()

const fitlerStatuses: { text: string; value: TestStatus }[] = [
  { text: 'Fail', value: 'fail' },
  { text: 'Pass', value: 'pass' }
]

const route = useRoute()
const mainStore = useMainStore()
const dialogViewComparisonRef = ref<InstanceType<
  typeof DialogViewComparison
> | null>()
const isDialogApprovalListVisible = ref(false)
const isSelecting = ref<string | undefined>()

const suite = computed(() => {
  return mainStore.displayReport?.suites.find((s) => s.id === props.suiteId)
})

async function doSelectionToggled(row: ResolvedTest) {
  const foundTest = mainStore.selectedTestsFlattenMap.get(row.baselinePath)
  foundTest ? onClickDeselect(foundTest) : await onClickSelect(row)
}

async function onClickSelect(row: ResolvedTest) {
  isSelecting.value = row.name
  try {
    const data = await addToStagedChanges({
      pipelineId: route.params.pipelineId as string,
      snapshot: row
    })
    const newSelections = [
      ...(mainStore.selectedTests.get(row.specPath) ?? []),
      { ...row, comparisonSha: data.sha }
    ]
    mainStore.selectedTests.set(row.specPath, newSelections)
  } catch (err) {
    ElMessage({
      type: 'error',
      message: (err as Error).message
    })
  }
  isSelecting.value = undefined
}

function onClickDeselect(row: ResolvedTest) {
  const newSelections = mainStore.selectedTests
    .get(row.specPath)!
    .filter((t) => t.name !== row.name)

  newSelections.length === 0
    ? mainStore.selectedTests.delete(row.specPath)
    : mainStore.selectedTests.set(row.specPath, newSelections)
}
</script>

<style scoped>
.el-table {
  border-radius: 1rem 1rem 0 0;
}

.el-table :deep(.min-content > .cell) {
  padding-right: 14px;
  display: flex;
  justify-content: right;
  align-items: center;
}

.filter-header {
  display: flex;
  align-items: center;
  padding: 4px 0;
}
.filter-header > .active {
  color: var(--color-primary);
}
.el-dropdown {
  color: unset;
  cursor: pointer;
}
:deep(.el-dropdown-menu__item) {
  display: flex;
  justify-content: space-between;
  min-width: 96px;
}
:deep(.el-dropdown-menu__item.el-dropdown-item--active) {
  color: var(--color-primary);
}
:deep(.el-dropdown-menu__item:not(.is-disabled):focus) {
  color: unset;
}
.actions {
  display: flex;
  gap: 1rem;
}
.actions > i {
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: 12px;
}
.el-table :deep(.el-table__cell) {
  position: relative;
}
.row-selected {
  position: absolute;
  left: 0;
  border-left: 3px solid var(--color-primary);
  height: calc(100% - 16px);
  top: 0;
  bottom: 0;
  margin: auto;
}
</style>
