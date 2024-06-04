<template>
  <main class="main-wrapper">
    <img
      style="height: 12rem"
      src="@/assets/images/cypress-image-diff-logo.png"
    />

    <h1 style="font-weight: bold">Cypress Image Diff HTML Report</h1>

    <p>
      An intuitive HTML report that provides a comprehensive overview of visual
      differences, empowering your team to quickly identify and resolve any UI
      inconsistencies.
    </p>

    <p>
      Take control of your web testing process and elevate your development
      workflow with the
      <a href="https://cypress.visual-image-diff.dev/getting-started">
        cypress-image-diff</a
      >.
    </p>

    <p>
      If you encounter any problems, please report them
      <a href="https://github.com/kien-ht/cypress-image-diff-github-app/issues"
        >here</a
      >.
    </p>

    <a
      v-if="mainStore.hasLoggedIn"
      :href="installationUrl"
      class="link-button"
    >
      <img src="@/assets/images/github.png" />
      <span>Install Cypress Image Diff</span>
    </a>
    <a
      v-else
      :href="githubLoginUrl"
      class="link-button"
    >
      <img src="@/assets/images/github.png" />
      <span>Login With Github</span>
    </a>
  </main>

  <footer class="footer">
    <a href="https://github.com/uktrade/cypress-image-diff">
      <img src="@/assets/images/github.png" />
      <span>Source</span>
    </a>
  </footer>
</template>

<script lang="ts" setup>
import { useMainStore } from '@/store'

const mainStore = useMainStore()

const githubLoginUrl = computed(
  () =>
    `https://github.com/login/oauth/authorize?client_id=${mainStore.publicConfig?.clientId}`
)
const installationUrl =
  'https://github.com/apps/cypress-image-diff/installations/new'
</script>

<style scoped>
.main-wrapper {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  justify-content: center;
  margin: auto;
  max-width: 60rem;
  padding: 2rem;
  text-align: center;
}

.footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  padding: 2rem;
}

.footer > * {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
