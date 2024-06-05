<template>
  <div class="wrapper">
    <h2 class="title">Projects</h2>

    <p>
      Here is the list of Github repositories that have installed Cypress Image
      Diff, accessible through your account. If you want to add or remove any
      project from this list, please go to your
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
      :data="projects"
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
  </div>
</template>

<script lang="ts" setup>
import type { Project } from '@commonTypes'

const projects: Project[] = [
  {
    name: 'My first project',
    repositoryId: 312321,
    owner: 'octokat',
    id: '3124',
    description: 'This is just an example',
    url: 'https://github.com/octocat/Hello-World',
    settings: {
      envs: [
        {
          key: 'CIRCLE_CI_TEST',
          value: 'ajcij3ioj2313912c',
          createdAt: '2024-06-03T14:29:38.000Z'
        },
        {
          key: 'CIRCLE_CI_DEMO',
          value: 'cdsv252ethgf',
          createdAt: '2024-06-03T17:03:19.000Z'
        }
      ]
    }
  },
  {
    name: 'My second project',
    repositoryId: 123,
    owner: 'octocat',
    id: '123343',
    description: 'This is just an example',
    url: 'https://github.com/octocat/Hello-World',
    settings: {
      envs: [
        {
          key: '2_CIRCLE_CI_TEST',
          value: '3f31fcxbvx',
          createdAt: '2024-06-03T14:29:38.000Z'
        },
        {
          key: '2_CIRCLE_CI_DEMO',
          value: 'cdsv252efafthgf',
          createdAt: '2024-06-03T14:29:38.000Z'
        }
      ]
    }
  }
]

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
}
</style>
