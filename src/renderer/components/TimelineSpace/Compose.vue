<template>
  <div class="compose">
    <el-form :model="form" class="compose-form">
      <el-input v-model="form.status" type="textarea" :autosize="{ minRows: 2 }" :placeholder="$t('modals.new_toot.status')" />
      <div class="form-footer">
        <el-button-group class="tool-buttons">
          <el-button link size="default">
            <font-awesome-icon icon="camera" />
          </el-button>
          <el-button link size="default" disabled>
            <font-awesome-icon icon="square-poll-horizontal" />
          </el-button>
          <el-button link size="default">
            <font-awesome-icon icon="globe" />
          </el-button>
          <el-button link size="default">
            <font-awesome-icon :icon="['far', 'face-smile']" />
          </el-button>
        </el-button-group>
        <div class="actions-group">
          <span>500</span>
          <el-button type="primary"> {{ $t('modals.new_toot.toot') }} </el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'

export default defineComponent({
  name: 'Compose',
  setup() {
    const form = reactive({
      status: ''
    })

    return {
      form
    }
  }
})
</script>

<style lang="scss" scoped>
.compose {
  height: auto;
  width: 100%;
  box-sizing: border-box;

  .compose-form {
    height: calc(100% - 24px);
  }

  .compose-form :deep(.el-textarea__inner) {
    color: var(--theme-primary-color);
    background-color: var(--theme-background-color);
    box-shadow: 0 0 0 1px var(--theme-border-color, var(--theme-border-color)) inset;
  }

  .form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;

    .tool-buttons {
      button {
        margin-right: 8px;
      }
    }

    .actions-group {
      span {
        margin-right: 8px;
        color: var(--theme-secondary-color);
      }
    }
  }
}
</style>
