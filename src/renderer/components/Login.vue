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
      <router-view />
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useMagicKeys, whenever } from '@vueuse/core'

export default defineComponent({
  name: 'login',
  setup() {
    const router = useRouter()
    const { escape } = useMagicKeys()

    whenever(escape, () => {
      close()
    })

    const close = () => {
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
