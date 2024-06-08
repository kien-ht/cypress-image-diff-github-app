<template>
  <div class="wrapper">
    <h2 class="title">Projects</h2>

    <template v-if="mainStore.projects.length">
      <p>
        Here is the list of Github repositories that have installed Cypress
        Image Diff, accessible through your account. If you want to add or
        remove any project from this list, please go to your
        <a
          href="https://github.com/settings/installations"
          target="_blank"
        >
          Github account settings
          <BaseIcon name="external-link" /></a
        >, click to configure our app and update your repository access.
      </p>

      <el-table
        size="large"
        :data="mainStore.projects"
        :row-key="(row: Project) => row.id"
      >
        <el-table-column
          type="index"
          width="50"
        />

        <el-table-column
          label="Repository"
          property="name"
        >
          <template #default="{ row }">
            <router-link
              :to="{ name: 'PageReportDetails', query: { id: row.id } }"
              >{{ row.name }}</router-link
            >
          </template>
        </el-table-column>

        <el-table-column
          label="Owner"
          property="owner"
        />

        <el-table-column width="135">
          <template #default="{ row }">
            <DashboardMenuProjectsSettings
              :project="row"
              @saved="doSavedSettings"
            />
          </template>
        </el-table-column>
      </el-table>
    </template>

    <template v-else>
      <p>Link your Github repository with Cypress Image Diff to get started.</p>

      <a
        :href="installationUrl"
        class="link-button"
      >
        <img src="@/assets/images/github.png" />
        <span>Install Cypress Image Diff</span>
      </a>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { Project } from '@commonTypes'
import { GITHUB_APP_NAME } from '../../common/constants'
import { useMainStore } from '@/store'

const mainStore = useMainStore()
const installationUrl = `https://github.com/apps/${GITHUB_APP_NAME}/installations/new`

function doSavedSettings(project: Project) {
  // eslint-disable-next-line no-console
  console.log(project)
}
</script>

<style scoped>
.wrapper {
  display: grid;
  gap: 1rem;
  margin: 0 15%;
  padding: 0 3rem 3rem 3rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
}

.wrapper > .title {
  margin-top: 2rem;
  font-weight: bold;
}

.wrapper > .el-table {
  margin-top: 2rem;
  border-radius: 1rem;

  --el-table-header-bg-color: var(--color-background-mute);
}
.link-button {
  place-self: start;
  margin-top: 2rem;
}
</style>
