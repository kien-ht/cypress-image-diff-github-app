<template>
  <main class="main-wrapper box-shadow-regular">
    <h1 style="font-weight: bold">Cypress Image Diff</h1>

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
      :href="githubSignInUrl"
      class="link-button"
    >
      <img src="@/assets/images/github.png" />
      <span>Sign In With Github</span>
    </a>

    <p>
      Don't have an account yet?
      <a :href="githubSignUpUrl"> Sign Up With Github </a>
    </p>
  </main>
</template>

<script lang="ts" setup>
import { useMainStore } from '@/store'
import { GithubAuthActionType } from '@/constants'

const mainStore = useMainStore()

const githubSignInUrl = computed(
  () =>
    `https://github.com/login/oauth/authorize?client_id=${mainStore.publicConfig?.clientId}&state=${GithubAuthActionType.SIGN_IN}`
)

const githubSignUpUrl = computed(
  () =>
    `https://github.com/login/oauth/authorize?client_id=${mainStore.publicConfig?.clientId}&state=${GithubAuthActionType.SIGN_UP}`
)
</script>

<style scoped>
.main-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  justify-content: center;
  max-width: 60rem;
  padding: 4rem;
  text-align: center;
  border-radius: 2rem;

  background-color: var(--el-color-primary-light-9);
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
