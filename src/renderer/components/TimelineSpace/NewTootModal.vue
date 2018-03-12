<template>
  <el-dialog
    title="New Toot"
    :visible.sync="newTootModal"
    width="400px"
    custom-class="new-toot-modal">
    <el-form :model="tootForm">
      <el-input type="textarea" v-model="tootForm.body" class="body"></el-input>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button>Cancel</el-button>
      <el-button type="primary">Toot</el-button>
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
        border: 0;
        resize: none;
        height: 120px;
      }
    }
  }

  .el-dialog__footer {
    background-color: #f2f6fc;
  }
}
</style>
