<template>
  <el-button
    type="info"
    plain
    @click="isSettingsDrawerOpen = true"
  >
    <BaseIcon
      name="settings"
      width="14"
    />
    <span style="margin-left: 0.5rem">Settings</span>
  </el-button>

  <el-drawer
    v-if="isSettingsDrawerOpen"
    v-model="isSettingsDrawerOpen"
    ref="settingsDrawerRef"
    direction="rtl"
    append-to-body
    size="40%"
    style="min-width: 40rem"
  >
    <template #header>
      <h3>Project Settings / {{ props.project.name }}</h3>
    </template>
    <template #default>
      <div class="drawer-body">
        <h4 style="font-weight: bold; margin">Project Secrets</h4>

        <p>
          Project Secrets enable you to store confidential information, such as
          API keys for a specific project. Once set, the values of these secrets
          cannot be viewed or modified.
        </p>

        <el-form
          ref="formRef"
          :model="envVariableForm"
          size="large"
        >
          <el-form-item
            prop="key"
            :rules="[{ required: true, message: 'This field is required' }]"
          >
            <el-input
              v-model="envVariableForm.key"
              aria-label="Key"
              placeholder="Key"
            />
          </el-form-item>
          <el-form-item
            prop="value"
            :rules="[{ required: true, message: 'This field is required' }]"
          >
            <el-input
              v-model="envVariableForm.value"
              aria-label="Value"
              placeholder="Value"
            />
          </el-form-item>

          <el-form-item class="submit-button">
            <el-button
              type="primary"
              plain
              @click="submitForm"
            >
              Add
            </el-button>
          </el-form-item>
        </el-form>

        <el-table
          size="large"
          :data="updatedEnvs"
          :row-key="(row: EnvironmentVariable) => row.key"
          class="box-shadow-regular"
        >
          <el-table-column
            type="index"
            width="50"
          />

          <el-table-column
            label="Key"
            property="key"
          />

          <el-table-column
            label="Value"
            property="value"
          />

          <el-table-column
            label="Created At"
            property="createdAt"
          >
            <template #default="{ row }">
              {{ $G.formatDateTime(row.createdAt) || 'Draft' }}
            </template>
          </el-table-column>

          <el-table-column width="60">
            <template #default="{ row }">
              <button
                class="remove-button"
                type="button"
                @click="onClickRemove(row)"
              >
                <BaseIcon name="close" />
              </button>
            </template>
          </el-table-column>
        </el-table>

        <div style="flex: 1 1 auto" />

        <el-button
          type="primary"
          @click="onClickSave"
        >
          Save
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts">
export interface DashboardMenuProjectsSettingsProps {
  project: Project
}

export interface DashboardMenuProjectsSettingsEmits {
  (e: 'saved', project: Project): void
}
</script>

<script lang="ts" setup>
import {
  ElNotification,
  type FormInstance,
  ElDrawer as ElDrawerComponent
} from 'element-plus'
import merge from 'lodash/merge'

import type { EnvironmentVariable, Project } from '@commonTypes'

const props = defineProps<DashboardMenuProjectsSettingsProps>()

const emit = defineEmits<DashboardMenuProjectsSettingsEmits>()

const isSettingsDrawerOpen = ref(false)
const envVariableForm = reactive<EnvironmentVariable>({
  key: '',
  value: '',
  createdAt: ''
})
const formRef = ref<FormInstance>()
const settingsDrawerRef = ref<InstanceType<typeof ElDrawerComponent>>()
const updatedEnvs = ref(props.project.settings.envs)

function submitForm() {
  formRef.value?.validate((valid) => {
    if (!valid) return

    if (updatedEnvs.value.some((u) => u.key === envVariableForm.key)) {
      ElNotification({
        type: 'error',
        message: 'Secret key already exists'
      })
      return
    }

    updatedEnvs.value.push({ ...envVariableForm })
    formRef.value!.resetFields()
  })
}

async function onClickSave() {
  emit(
    'saved',
    merge(props.project, {
      settings: {
        envs: updatedEnvs.value
      }
    })
  )
  settingsDrawerRef.value!.handleClose()
}

function onClickRemove(row: EnvironmentVariable) {
  updatedEnvs.value = updatedEnvs.value.filter((u) => u.key !== row.key)
}
</script>

<style scoped>
.drawer-body {
  height: 100%;
}
.drawer-body,
.el-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.drawer-body > .el-table {
  --el-table-header-bg-color: var(--color-background-mute);
  border-radius: 1rem;
}
.drawer-body > .el-form {
  display: flex;
  flex-direction: row;
}
.drawer-body > .el-form > .el-form-item:not(.submit-button) {
  flex: 1 1 auto;
}

.drawer-body .el-table .remove-button {
  color: var(--color-danger);
  background-color: transparent;
  border: none;
  cursor: pointer;
}
</style>
