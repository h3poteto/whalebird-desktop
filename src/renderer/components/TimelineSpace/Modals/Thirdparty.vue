<template>
  <div class="thirdparty">
    <el-dialog :title="$t('modals.thirdparty.title')" v-model="modalOpen" width="500px" class="thirdparty-modal">
      <table class="licenses">
        <tbody>
          <tr v-for="lib in thirdparty" :key="lib">
            <td>{{ lib.package_name }}</td>
            <td>{{ lib.license }}</td>
          </tr>
        </tbody>
      </table>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { MyWindow } from '~/src/types/global'
import thirdparty from '~/src/config/thirdparty.json'

export default defineComponent({
  name: 'Thirdparty',
  setup() {
    const win = window as any as MyWindow
    const modalOpen = ref(false)

    onMounted(() => {
      win.ipcRenderer.on('open-thirdparty-modal', () => {
        modalOpen.value = true
      })
    })

    return {
      modalOpen,
      thirdparty
    }
  }
})
</script>

<style lang="scss" scoped>
.thirdparty :deep() {
  .el-dialog__header {
    background-color: #4a5664;
    margin-right: 0;

    .el-dialog__title {
      color: #ebeef5;
    }
  }

  .el-dialog__body {
    max-height: 400px;
    box-sizing: border-box;
    overflow: auto;
  }

  .thirdparty-modal {
    max-height: 70%;
    overflow: hidden;
    position: relative;
  }
}

.thirdparty {
  .licenses {
    text-align: left;
    border-collapse: collapse;
    line-height: 28px;
    width: 100%;

    tr {
      border: none;

      &:nth-child(even) {
        background-color: #fafafa;
      }

      &:hover {
        background-color: #f2f6fc;
      }

      td {
        padding: 4px 8px;
      }
    }

    kbd {
      display: inline-block;
      padding: 3px 5px;
      font-size: 11px;
      line-height: 10px;
      color: #444d56;
      vertical-align: middle;
      background-color: #fafbfc;
      border: solid 1px #c6cbd1;
      border-bottom-color: #959da5;
      border-radius: 3px;
      box-shadow: inset 0 -1px 0 #959da5;
    }
  }
}
</style>
