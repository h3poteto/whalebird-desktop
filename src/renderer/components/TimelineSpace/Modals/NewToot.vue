<template>
  <el-dialog
    :title="$t('modals.new_toot.title')"
    :visible.sync="newTootModal"
    width="400px"
    class="new-toot-modal">
    <el-form v-on:submit.prevent="toot">
      <div class="spoiler" v-show="showContentWarning">
        <el-input :placeholder="$t('modals.new_toot.cw')" v-model="spoiler"></el-input>
      </div>
      <Status
        v-model="status"
        :opened="newTootModal"
        @toot="toot"
        />
    </el-form>
    <div class="preview">
      <div class="image-wrapper" v-for="media in attachedMedias" v-bind:key="media.id">
        <img :src="media.preview_url" class="preview-image" />
        <el-button size="small" type="text" @click="removeAttachment(media)" class="remove-image"><icon name="times-circle"></icon></el-button>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <div class="upload-image">
        <el-button size="small" type="text" @click="selectImage"><icon name="camera"></icon></el-button>
        <input name="image" type="file" class="image-input" ref="image" @change="onChangeImage" :key="attachedMediaId"/>
      </div>
      <div class="privacy">
        <el-dropdown trigger="click" @command="changeVisibility">
          <el-button size="small" type="text"><icon :name="visibilityIcon"></icon></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="visibilityList.Public.value">
              <icon name="globe" class="privacy-icon"></icon>
              {{ visibilityList.Public.name }}
            </el-dropdown-item>
            <el-dropdown-item :command="visibilityList.Unlisted.value">
              <icon name="unlock" class="privacy-icon"></icon>
              {{ visibilityList.Unlisted.name }}
            </el-dropdown-item>
            <el-dropdown-item :command="visibilityList.Private.value">
              <icon name="lock" class="privacy-icon"></icon>
              {{ visibilityList.Private.name }}
            </el-dropdown-item>
            <el-dropdown-item :command="visibilityList.Direct.value">
              <icon name="envelope" class="privacy-icon" scale="0.8"></icon>
              {{ visibilityList.Direct.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="sensitive" v-show="attachedMedias.length > 0">
        <el-button size="small" type="text" @click="changeSensitive">
          <icon name="eye-slash" v-show="sensitive"></icon>
          <icon name="eye" v-show="!sensitive"></icon>
        </el-button>
      </div>
      <div class="content-warning">
        <el-button size="small" type="text" @click="showContentWarning = !showContentWarning">
          CW
        </el-button>
      </div>
      <span class="text-count">{{ 500 - status.length }}</span>
      <el-button @click="close">{{ $t('modals.new_toot.cancel') }}</el-button>
      <el-button type="primary" @click="toot" v-loading="blockSubmit">{{ $t('modals.new_toot.toot') }}</el-button>
      <div class="clearfix"></div>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import Visibility from '~/src/constants/visibility'
import Status from './NewToot/Status'

export default {
  name: 'new-toot',
  components: {
    Status
  },
  data () {
    return {
      showContentWarning: false,
      visibilityList: Visibility
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
      attachedMediaId: state => state.TimelineSpace.Modals.NewToot.attachedMediaId,
      blockSubmit: state => state.TimelineSpace.Modals.NewToot.blockSubmit,
      visibility: state => state.TimelineSpace.Modals.NewToot.visibility,
      sensitive: state => state.TimelineSpace.Modals.NewToot.sensitive,
      visibilityIcon: (state) => {
        switch (state.TimelineSpace.Modals.NewToot.visibility) {
          case Visibility.Public.value:
            return 'globe'
          case Visibility.Unlisted.value:
            return 'unlock'
          case Visibility.Private.value:
            return 'lock'
          case Visibility.Direct.value:
            return 'envelope'
          default:
            return 'globe'
        }
      }
    }),
    newTootModal: {
      get () {
        return this.$store.state.TimelineSpace.Modals.NewToot.modalOpen
      },
      set (value) {
        if (value) {
          this.$store.dispatch('TimelineSpace/Modals/NewToot/openModal')
        } else {
          this.$store.dispatch('TimelineSpace/Modals/NewToot/closeModal')
        }
      }
    },
    status: {
      get () {
        return this.$store.state.TimelineSpace.Modals.NewToot.status
      },
      set (value) {
        this.$store.commit('TimelineSpace/Modals/NewToot/updateStatus', value)
      }
    },
    spoiler: {
      get () {
        return this.$store.state.TimelineSpace.Modals.NewToot.spoiler
      },
      set (value) {
        this.$store.commit('TimelineSpace/Modals/NewToot/updateSpoiler', value)
      }
    }
  },
  watch: {
    newTootModal: function (newState, oldState) {
      if (!oldState && newState) {
        this.showContentWarning = false
      }
    }
  },
  methods: {
    close () {
      this.filteredAccount = []
      this.$store.dispatch('TimelineSpace/Modals/NewToot/resetMediaId')
      this.$store.dispatch('TimelineSpace/Modals/NewToot/closeModal')
    },
    toot () {
      if (!this.newTootModal) {
        return
      }
      if (this.status.length <= 0 || this.status.length >= 500) {
        return this.$message({
          message: 'Toot length should be 1 to 500',
          type: 'error'
        })
      }
      const visibilityKey = Object.keys(Visibility).find((key) => {
        return Visibility[key].value === this.visibility
      })
      let form = {
        status: this.status,
        visibility: Visibility[visibilityKey].key,
        sensitive: this.sensitive,
        spoiler_text: this.spoiler
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
        .catch(() => {
          this.$message({
            message: 'Could not toot',
            type: 'error'
          })
        })
      this.close()
    },
    selectImage () {
      this.$refs.image.click()
    },
    onChangeImage (e) {
      if (e.target.files.item(0) === null || e.target.files.item(0) === undefined) {
        return
      }
      const file = e.target.files.item(0)
      if (!file.type.includes('image') && !file.type.includes('video')) {
        this.$message({
          message: 'You can only attach images or videos',
          type: 'error'
        })
        return
      }
      this.updateImage(file)
    },
    updateImage (file) {
      this.$store.dispatch('TimelineSpace/Modals/NewToot/incrementMediaId')
      this.$store.dispatch('TimelineSpace/Modals/NewToot/uploadImage', file)
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
    changeVisibility (level) {
      this.$store.commit('TimelineSpace/Modals/NewToot/changeVisibilityValue', level)
    },
    changeSensitive () {
      this.$store.commit('TimelineSpace/Modals/NewToot/changeSensitive', !this.sensitive)
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

    .spoiler {
      box-sizing: border-box;
      padding: 4px 0;
      background-color: #4a5664;

      input {
        border-radius: 0;
        font-family: 'Lato', sans-serif;

        &::placeholder {
          color: #c0c4cc;
        }
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

    .privacy {
      float: left;
      margin-left: 8px;
    }

    .sensitive {
      float: left;
      margin-left: 8px;
    }

    .content-warning {
      float: left;
      margin-left: 8px;

      span {
        font-weight: 800;
      }
    }

    .text-count {
      padding-right: 24px;
      color: #909399;
    }
  }
}

.privacy-icon {
  margin-right: 4px;
}
</style>
