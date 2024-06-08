<template>
  <div class="wrapper">
    <h2 class="title">User Profile</h2>

    <div class="content">
      <el-form
        :model="userForm"
        label-width="auto"
        label-position="top"
        size="large"
      >
        <el-form-item label="User Name">
          <el-input
            disabled
            v-model="userForm.name"
          />
        </el-form-item>

        <el-form-item label="Github Url">
          <el-input
            disabled
            v-model="userForm.githubUrl"
          />
        </el-form-item>

        <!-- <el-form-item>
        <el-button
          type="primary"
          @click="onSubmit"
        >
          Save
        </el-button>
      </el-form-item> -->
      </el-form>

      <el-avatar
        :size="150"
        :src="mainStore.user?.githubAvatar"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useMainStore } from '@/store'

const mainStore = useMainStore()

const userForm = reactive({
  name: mainStore.user?.githubName,
  githubUrl: mainStore.user?.githubUrl
})
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

.el-form {
  flex: 1 1 auto;
}

.wrapper > .content {
  display: flex;
  gap: 3rem;
}
.el-avatar {
  margin: 3rem;
}
</style>
