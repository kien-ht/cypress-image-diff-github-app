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

        <el-button
          type="danger"
          plain
          style="margin-top: 2rem"
          @click="onClickSignOut"
        >
          Sign Out
        </el-button>
      </el-form>

      <el-avatar
        :size="150"
        :src="mainStore.user?.githubAvatar"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'

import { signOut } from '@/service'
import { useMainStore } from '@/store'

const mainStore = useMainStore()
const router = useRouter()

const userForm = reactive({
  name: mainStore.user?.githubName,
  githubUrl: mainStore.user?.githubUrl
})

async function onClickSignOut() {
  try {
    await ElMessageBox.confirm('Would you like to sign out?', 'Sign Out', {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
    try {
      await signOut()
      mainStore.$reset()
      router.push({ name: 'PageHome' })
    } catch (err) {
      ElMessage({ type: 'error', message: (err as Error).message })
    }
  } catch {
    // empty
  }
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
