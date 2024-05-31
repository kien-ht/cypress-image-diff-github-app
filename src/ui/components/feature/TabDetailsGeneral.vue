<template>
  <HorizontalCollapse v-model:expanded="isExpanded">
    <div
      v-loading="mainStore.isLoadingReport"
      class="general-wrapper"
    >
      <template v-if="!isEmpty($route.query)">
        <h4>Github Repository</h4>
        <div class="general-wrapper__cell">
          <img
            src="@/assets/images/github.png"
            height="20"
          />
          <a
            :href="pullRequest.repoUrl"
            target="_blank"
            class="external-link"
          >
            {{ pullRequest.repoName }}
            <BaseIcon name="external-link" />
          </a>
        </div>

        <div
          v-if="pullRequest.author"
          class="general-wrapper__cell"
        >
          <img
            :src="pullRequest.authorAvatar"
            width="20"
            style="border-radius: 4px"
          />
          <span
            :href="pullRequest.url"
            target="_blank"
          >
            {{ pullRequest.author }}
            pushed
          </span>
        </div>

        <div class="general-wrapper__cell head-branch">
          <BaseIcon name="branch" />
          <code>
            {{ pullRequest.branch }}
          </code>
        </div>

        <div class="general-wrapper__cell target-branch">
          <BaseIcon
            name="right-chevron"
            style="color: var(--color-text)"
          />
          <code style="margin-left: -0.5rem">
            {{ pullRequest.targetBranch }}
          </code>
        </div>

        <div class="general-wrapper__cell">
          <BaseIcon name="commit" />
          <a
            :href="pullRequest.commitUrl"
            target="_blank"
            class="external-link"
          >
            Commit
            {{ pullRequest.commitHash.slice(0, 7) }}
            <BaseIcon name="external-link" />
          </a>
        </div>

        <a
          :href="pullRequest.url"
          target="_blank"
          class="link-button"
        >
          <BaseIcon name="pull-request" />
          <span>See Pull Request</span>
        </a>
      </template>

      <template v-if="mainStore.report">
        <h4>Environment</h4>

        <div
          v-if="browser"
          class="general-wrapper__cell"
        >
          <img
            :src="browserIconMap[browser]"
            height="20"
          />
          <span style="text-transform: capitalize">{{ browser }}</span>
          <span>- {{ mainStore.report.browserVersion }}</span>
        </div>

        <div class="general-wrapper__cell">
          <img
            src="@/assets/images/cypress.png"
            height="20"
          />
          <span>Cypress - {{ mainStore.report.cypressVersion }}</span>
        </div>
      </template>

      <a
        href="https://github.com/kien-ht/cypress-image-diff-github-app/issues"
        class="report-issue-link"
      >
        Report an issue
      </a>

      <el-button
        type="primary"
        plain
        class="collapse-button"
        @click="isExpanded = !isExpanded"
      >
        <BaseIcon
          name="right-chevron"
          width="15"
          :style="{ transform: 'rotate(180deg)' }"
        />
      </el-button>
    </div>
  </HorizontalCollapse>

  <div
    v-if="!isExpanded"
    class="expand-bar"
  >
    <el-button
      type="primary"
      plain
      @click="isExpanded = true"
    >
      <BaseIcon
        name="right-chevron"
        width="15"
      />
    </el-button>
  </div>
</template>

<script lang="ts">
export type Browser = 'chrome' | 'edge' | 'firefox' | 'safari' | 'electron'

export interface PullRequestInstance {
  url: string
  repoName: string
  repoUrl: string
  branch: string
  author?: string
  authorAvatar?: string
  targetBranch: string
  commitHash: string
  commitUrl: string
}
</script>

<script lang="ts" setup>
import { useRoute } from 'vue-router'

import { useMainStore } from '@/store'
import { DetailsUrlQuery } from '@commonTypes'
import chrome from '@/assets/images/chrome.png'
import edge from '@/assets/images/edge.png'
import firefox from '@/assets/images/firefox.png'
import safari from '@/assets/images/safari.png'
import electron from '@/assets/images/electron.png'

const mainStore = useMainStore()
const route = useRoute()
const isExpanded = ref(true)

const pullRequest = computed<PullRequestInstance>(() => {
  const { pullNumber, owner, repo, ref, sha, targetRef, author, authorAvatar } =
    route.query as unknown as DetailsUrlQuery
  return {
    url: `https://github.com/${owner}/${repo}/pull/${pullNumber}`,
    repoName: `${owner}/${repo}`,
    repoUrl: `https://github.com/${owner}/${repo}`,
    branch: ref,
    targetBranch: targetRef,
    commitHash: sha,
    commitUrl: `https://github.com/${owner}/${repo}/pull/${pullNumber}/commits/${sha}`,
    author,
    authorAvatar
  }
})

const browserIconMap: Record<Browser, string> = {
  chrome,
  edge,
  firefox,
  safari,
  electron
}

const browser = computed(() => {
  return (Object.keys(browserIconMap) as Browser[]).find((key) =>
    mainStore.report?.browserName.toLowerCase().includes(key)
  )
})

function isEmpty(obj: Record<any, any>) {
  return Object.keys(obj).length === 0
}
</script>

<style scoped>
.general-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 1rem 1rem 0 0;
  background-color: var(--color-background-el);
  padding: 0.8rem 1.8rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: var(--color-text-secondary);

  border-right: 1.5rem solid var(--color-background-mute);
  width: 30rem;
  min-width: 30rem;
}

.general-wrapper > h4:not(:first-child) {
  margin-top: 3rem;
}
.general-wrapper__cell {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}
.general-wrapper__cell.head-branch {
  position: relative;
}
.general-wrapper__cell.target-branch {
  margin-left: 2.5rem;
}
.general-wrapper__cell.head-branch:before {
  content: '';
  border-left: 2px dotted var(--color-text-secondary);
  border-bottom: 2px dotted var(--color-text-secondary);
  position: absolute;
  bottom: -2.1rem;
  left: 0.8rem;
  height: 100%;
  width: 1.5rem;
}
.general-wrapper__cell > code {
  background-color: var(--color-background-mute);
  padding: 0 2px;
  border-radius: 0.5rem;
}
.general-wrapper__cell > .external-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.collapse-button {
  width: min-content;
  padding: 0rem;
  position: absolute;
  bottom: 1rem;
  right: 1.5rem;
}
.expand-bar {
  width: min-content;
  background-color: var(--color-background-mute);
  display: flex;
  align-items: end;
  padding-bottom: 1rem;
  border-radius: 1rem 1rem 0 0;
}
.expand-bar > .el-button {
  padding: 0;
}
.report-issue-link {
  margin-top: auto;
  color: var(--color-text-secondary);
  align-self: flex-start;
}
.link-button > svg {
  position: absolute;
}
.link-button > span {
  flex: 1 1 auto;
  text-align: center;
}
</style>
