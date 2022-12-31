<template>
  <el-container id="login">
    <el-header>
      <el-row>
        <el-col :span="24" class="close">
          <el-button class="close-button" link @click="close">
            <font-awesome-icon icon="xmark" />
          </el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <login-form v-if="appData === null" />
      <authorize v-else />
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/store'
import { useMagicKeys, whenever } from '@vueuse/core'
import LoginForm from './Login/LoginForm.vue'
import Authorize from './Login/Authorize.vue'
import { ACTION_TYPES } from '@/store/Login'

export default defineComponent({
  name: 'login',
  components: { LoginForm, Authorize },
  setup() {
    const space = 'Login'
    const store = useStore()
    const router = useRouter()
    const { escape } = useMagicKeys()

    const appData = computed(() => store.state.Login.appData)

    whenever(escape, () => {
      close()
    })

    const close = () => {
      store.dispatch(`${space}/${ACTION_TYPES.PAGE_BACK}`)
      return router.push({
        path: '/',
        query: { redirect: 'home' }
      })
    }

    return {
      close,
      appData
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
