<template>
  <el-dialog
    title="New Toot"
    :visible.sync="newTootModal"
    width="400px"
    class="new-toot-modal" v-on:submit.prevent="toot">
    <el-form :model="tootForm">
      <div class="status">
        <textarea v-model="tootForm.status" ref="status" @keyup.ctrl.enter.exact="toot" @keyup.meta.enter.exact="toot"></textarea>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <span class="text-count">{{ 500 - tootForm.status.length }}</span>
      <el-button @click="close">Cancel</el-button>
      <el-button type="primary" @click="toot">Toot</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'new-toot-modal',
  data () {
    return {
      tootForm: {
        status: ''
      }
    }
  },
  computed: {
    newTootModal: {
      get () {
        return this.$store.state.TimelineSpace.NewTootModal.modalOpen
      },
      set (value) {
        this.$store.commit('TimelineSpace/NewTootModal/changeModal', value)
      }
    }
  },
  updated () {
    if (this.newTootModal) {
      this.$refs.status.focus()
    }
  },
  methods: {
    close () {
      this.$store.commit('TimelineSpace/NewTootModal/changeModal', false)
    },
    toot () {
      if (this.tootForm.status.length <= 0 || this.tootForm.status.length >= 500) {
        return this.$message({
          message: 'Toot length should be 1 to 500',
          type: 'error'
        })
      }
      this.$store.dispatch('TimelineSpace/NewTootModal/postToot', this.tootForm)
        .then(() => {
          this.tootForm.status = ''
          this.$message({
            message: 'Toot',
            type: 'success'
          })
        })
        .catch(() => {
          this.$message({
            message: 'Could not toot',
            type: 'error'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.new-toot-modal /deep/ {
  .el-dialog__header {
    background-color: #4a5664;

    .el-dialog__title {
      color: #ebeef5;
    }
  }

  .el-dialog__body {
    padding: 0;

    .status {
      textarea {
        display: block;
        padding: 5px 15px;
        line-height: 1.5;
        box-sizing: border-box;
        width: 100%;
        font-size: inherit;
        color: #606266;
        background-color: #ffffff;
        background-image: none;
        border: 0;
        border-radius: 4px;
        resize: none;
        height: 120px;
        transition: border-color .2s cubic-bezier(.645,.045,.355,1);
      }

      textarea:focus {
        outline: 0;
      }
    }
  }

  .el-dialog__footer {
    background-color: #f2f6fc;

    .text-count {
      padding-right: 24px;
      color: #909399;
    }
  }
}
</style>
