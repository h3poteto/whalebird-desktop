<template>
  <el-dialog
    title="New Toot"
    :visible.sync="newTootModal"
    width="400px"
    custom-class="new-toot-modal">
    <el-form :model="tootForm">
      <div class="body">
        <textarea v-model="tootForm.body" ref="body"></textarea>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
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
        body: ''
      }
    }
  },
  computed: {
    newTootModal: {
      get () {
        return this.$store.state.TimelineSpace.newTootModal
      },
      set (value) {
        this.$store.commit('TimelineSpace/changeNewTootModal', value)
      }
    }
  },
  updated () {
    if (this.newTootModal) {
      this.$refs.body.focus()
    }
  },
  methods: {
    close () {
      this.$store.commit('TimelineSpace/changeNewTootModal', false)
    },
    toot () {
      this.$store.dispatch('TimelineSpace/postToot', this.tootForm.body)
        .then(() => {
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

<style lang="scss">
.new-toot-modal {
  .el-dialog__header {
    background-color: #4a5664;

    .el-dialog__title {
      color: #ebeef5;
    }
  }

  .el-dialog__body {
    padding: 0;

    .body {
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
  }
}
</style>
