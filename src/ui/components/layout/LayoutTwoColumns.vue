<template>
  <main class="plain-wrapper">
    <div class="logo">
      <img
        style="height: 25rem"
        src="@/assets/images/cypress-image-diff-logo.png"
      />
    </div>
    <slot></slot>
  </main>
</template>

<script lang="ts" setup></script>

<style scoped>
main.plain-wrapper {
  padding: 5rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 2rem;

  min-height: 100vh;
}

main.plain-wrapper > .logo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2rem;
}
main.plain-wrapper > .logo > img {
  border-radius: 3rem;
  box-shadow:
    rgba(0, 0, 0, 0.25) 0px 54px 55px,
    rgba(0, 0, 0, 0.12) 0px -12px 30px,
    rgba(0, 0, 0, 0.12) 0px 4px 6px,
    rgba(0, 0, 0, 0.17) 0px 12px 13px,
    rgba(0, 0, 0, 0.09) 0px -3px 5px;
}
</style>
