<template>
  <el-dialog
    title="New Toot"
    :visible.sync="newTootModal"
    width="400px"
    class="new-toot-modal">
    <el-form v-on:submit.prevent="toot">
      <div class="status">
        <textarea v-model="status" ref="status" v-shortkey="{linux: ['ctrl', 'enter'], mac: ['meta', 'enter']}" @shortkey="toot()"></textarea>
      </div>
    </el-form>
    <div class="preview">
      <div class="image-wrapper" v-for="media in attachedMedias" v-on:key="media.id">
        <img :src="media.preview_url" class="preview-image" />
        <el-button size="small" type="text" @click="removeAttachment(media)" class="remove-image"><icon name="times-circle"></icon></el-button>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <div class="upload-image">
        <el-button size="small" type="text" @click="selectImage"><icon name="camera"></icon></el-button>
        <input name="image" type="file" class="image-input" ref="image" @change="updateImage" :key="attachedImageId"/>
      </div>
      <span class="text-count">{{ 500 - status.length }}</span>
      <el-button @click="close">Cancel</el-button>
      <el-button type="primary" @click="toot" v-loading="blockSubmit">Toot</el-button>
      <div class="clearfix"></div>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'new-toot',
  data () {
    return {
      attachedImageId: 0
    }
  },
  computed: {
    ...mapState({
      replyToId: (state) => {
        if (state.TimelineSpace.Modals.NewToot.replyToMessage !== null) {
          return state.TimelineSpace.Modals.NewToot.replyToMessage.id
        } else {
          return null
        }
      },
      attachedMedias: state => state.TimelineSpace.Modals.NewToot.attachedMedias,
      blockSubmit: state => state.TimelineSpace.Modals.NewToot.blockSubmit
    }),
    newTootModal: {
      get () {
        return this.$store.state.TimelineSpace.Modals.NewToot.modalOpen
      },
      set (value) {
        this.$store.dispatch('TimelineSpace/Modals/NewToot/changeModal', value)
      }
    },
    status: {
      get () {
        return this.$store.state.TimelineSpace.Modals.NewToot.status
      },
      set (value) {
        this.$store.commit('TimelineSpace/Modals/NewToot/updateStatus', value)
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
      this.resetImage()
      this.$store.dispatch('TimelineSpace/Modals/NewToot/changeModal', false)
    },
    toot () {
      if (this.status.length <= 0 || this.status.length >= 500) {
        return this.$message({
          message: 'Toot length should be 1 to 500',
          type: 'error'
        })
      }
      let form = {
        status: this.status
      }
      if (this.replyToId !== null) {
        form = Object.assign(form, {
          in_reply_to_id: this.replyToId
        })
      }
      if (this.attachedMedias.length > 0) {
        if (this.attachedMedias.length > 4) {
          return this.$message({
            message: 'You can only attach up to 4 images',
            type: 'error'
          })
        }
        form = Object.assign(form, {
          media_ids: this.attachedMedias.map((m) => { return m.id })
        })
      }
      this.$store.dispatch('TimelineSpace/Modals/NewToot/postToot', form)
        .then(() => {
          this.close()
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
    },
    selectImage () {
      this.$refs.image.click()
    },
    updateImage (e) {
      this.resetImage()
      if (e.target.files.item(0) === null || e.target.files.item(0) === undefined) {
        return
      }
      if (!e.target.files.item(0).type.includes('image')) {
        this.$message({
          message: 'You can only attach images',
          type: 'error'
        })
        return
      }
      this.$store.dispatch('TimelineSpace/Modals/NewToot/uploadImage', e.target.files.item(0))
        .catch(() => {
          this.$message({
            message: 'Could not attach the file',
            type: 'error'
          })
        })
    },
    removeAttachment (media) {
      this.$store.commit('TimelineSpace/Modals/NewToot/removeMedia', media)
    },
    resetImage () {
      ++this.attachedImageId
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
