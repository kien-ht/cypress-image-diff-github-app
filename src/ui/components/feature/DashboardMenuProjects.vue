<template>
  <div class="wrapper">
    <h2 class="title">Projects</h2>
  </div>
</template>

<script lang="ts" setup></script>

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
</style>
