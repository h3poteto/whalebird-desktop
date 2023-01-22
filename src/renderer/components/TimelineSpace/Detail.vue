<template>
  <el-container>
    <el-header class="header-wrapper">
      <div class="header">
        <div>
          <el-button class="header-action" link @click="back">
            <font-awesome-icon icon="chevron-left" />
            Back
          </el-button>
        </div>
        <div>
          <el-button class="header-action" link @click="close">
            <font-awesome-icon icon="xmark" />
          </el-button>
        </div>
      </div>
    </el-header>
    <el-main class="main">
      <Status v-if="target() === 'status'" />
    </el-main>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Status from './Detail/Status.vue'

export default defineComponent({
  name: 'Detail',
  components: { Status },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const close = () => {
      router.push({
        query: {}
      })
    }

    const back = () => {
      router.back()
    }

    const target = () => {
      if (route.query.status_id?.toString()) {
        return 'status'
      } else if (route.query.account_id?.toString()) {
        return 'account'
      }
      return null
    }

    return {
      close,
      back,
      target
    }
  }
})
</script>

<style lang="scss" scoped>
.header-wrapper {
  height: auto;
  border-bottom: 1px solid var(--theme-border-color);
}

.header {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  line-height: 32px;

  .header-action {
    color: var(--theme-secondary-color);

    &:hover {
      color: #409eff;
    }
  }
}

.main {
  margin: 0;
  padding: 0;
}
</style>
