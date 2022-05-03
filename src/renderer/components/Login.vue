<template>
  <el-container id="login">
    <el-header>
      <el-row>
        <el-col :span="24" class="close">
          <el-button type="text" @click="close" class="close-button">
            <font-awesome-icon icon="xmark" />
          </el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <div></div>
      <login-form></login-form>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/store'
import LoginForm from './Login/LoginForm.vue'
import { ACTION_TYPES } from '@/store/Login'

export default defineComponent({
  name: 'login',
  components: { LoginForm },
  setup() {
    const space = 'Login'
    const store = useStore()
    const router = useRouter()

    const close = () => {
      store.dispatch(`${space}/${ACTION_TYPES.PAGE_BACK}`)
      return router.push({
        path: '/',
        query: { redirect: 'home' }
      })
    }

    return {
      close
    }
  }
})
</script>

<style lang="scss" scoped>
#login {
  background-color: #292f3f;
  color: #ffffff;
  text-align: center;
  min-height: 100%;

  .close {
    text-align: right;

    .close-button {
      font-size: 24px;
    }
  }
}
</style>
