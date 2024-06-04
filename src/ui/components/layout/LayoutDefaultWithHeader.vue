<template>
  <header class="header">
    <img
      style="height: 4rem"
      src="@/assets/images/cypress-image-diff-logo.png"
    />

    <h1 style="font-weight: bold">Cypress Image Diff</h1>
  </header>

  <slot></slot>
</template>

<script lang="ts" setup></script>

<style scoped>
.header {
  padding: 1.5rem 2rem;

  display: flex;
  gap: 1rem;
  align-items: center;

  border-bottom: 2px solid var(--color-border);
}
</style>
