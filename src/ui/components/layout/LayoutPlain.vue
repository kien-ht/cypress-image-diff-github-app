<template>
  <main class="two-columns-wrapper">
    <slot></slot>
  </main>
</template>

<script lang="ts" setup></script>

<style scoped>
main.two-columns-wrapper {
  padding: 5rem;
  display: grid;
  gap: 2rem;

  min-height: 100vh;
}
</style>
