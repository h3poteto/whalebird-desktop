<template>
  <el-dialog
    title="Toot Detail"
    :visible.sync="tootModal"
    width="400px"
    class="toot-modal">
    Hello World
  </el-dialog>
</template>

<script>
export default {
  name: 'toot',
  computed: {
    tootModal: {
      get () {
        return this.$store.state.TimelineSpace.Modals.Toot.modalOpen
      },
      set (value) {
        this.$store.dispatch('TimelineSpace/Modals/Toot/changeModal', value)
      }
    }
  },
  updated () {
    if (this.TootModal) {
      this.$refs.status.focus()
    }
  },
  methods: {
    close () {
      this.$store.dispatch('TimelineSpace/Modals/Toot/changeModal', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.toot-modal /deep/ {
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

    .preview {
      box-sizing: border-box;
      padding: 0 12px;

      .image-wrapper {
        position: relative;
        display: inline-block;

        .preview-image {
          width: 60px;
          margin-right: 8px;
        }

        .remove-image {
          position: absolute;
          top: 0;
          left: 0;
          padding: 0;
          cursor: pointer;
        }
      }
    }
  }

  .el-dialog__footer {
    background-color: #f2f6fc;

    .upload-image {
      text-align: left;
      float: left;

      .image-input {
        display: none;
      }
    }

    .text-count {
      padding-right: 24px;
      color: #909399;
    }
  }
}
</style>
