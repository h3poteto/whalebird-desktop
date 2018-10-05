<template>
  <el-dialog
    :title="$t('modals.new_toot.title')"
    :visible.sync="newTootModal"
    :before-close="closeConfirm"
    width="400px"
    class="new-toot-modal">
    <el-form v-on:submit.prevent="toot">
      <div class="spoiler" v-show="showContentWarning">
        <el-input :placeholder="$t('modals.new_toot.cw')" v-model="spoiler"></el-input>
      </div>
      <Status
        v-model="status"
        :opened="newTootModal"
        :fixCursorPos="hashtagInserting"
        @paste="onPaste"
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
        <el-button size="small" type="text" @click="selectImage" :title="$t('modals.new_toot.add_image')">
          <icon name="camera"></icon>
        </el-button>
        <input name="image" type="file" class="image-input" ref="image" @change="onChangeImage" :key="attachedMediaId"/>
      </div>
      <div class="privacy">
        <el-dropdown trigger="click" @command="changeVisibility">
          <el-button size="small" type="text" :title="$t('modals.new_toot.change_visibility')">
            <icon :name="visibilityIcon"></icon>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="visibilityList.Public.value">
              <icon name="globe" class="privacy-icon"></icon>
              {{ $t(visibilityList.Public.name) }}
            </el-dropdown-item>
            <el-dropdown-item :command="visibilityList.Unlisted.value">
              <icon name="unlock" class="privacy-icon"></icon>
              {{ $t(visibilityList.Unlisted.name) }}
            </el-dropdown-item>
            <el-dropdown-item :command="visibilityList.Private.value">
              <icon name="lock" class="privacy-icon"></icon>
              {{ $t(visibilityList.Private.name) }}
            </el-dropdown-item>
            <el-dropdown-item :command="visibilityList.Direct.value">
              <icon name="envelope" class="privacy-icon" scale="0.8"></icon>
              {{ $t(visibilityList.Direct.name) }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="sensitive" v-show="attachedMedias.length > 0">
        <el-button size="small" type="text" @click="changeSensitive" :title="$t('modals.new_toot.change_sensitive')">
          <icon name="eye-slash" v-show="sensitive"></icon>
          <icon name="eye" v-show="!sensitive"></icon>
        </el-button>
      </div>
      <div class="content-warning">
        <el-button size="small" type="text" @click="showContentWarning = !showContentWarning" :title="$t('modals.new_toot.add_cw')" :class="showContentWarning? '' : 'clickable'">
          <span class="cw-text">CW</span>
        </el-button>
      </div>
      <div class="pined-hashtag">
        <el-button size="small" type="text" @click="pinedHashtag = !pinedHashtag" :title="$t('modals.new_toot.pined_hashtag')" :class="pinedHashtag? '' : 'clickable'">
          <icon name="hashtag"></icon>
        </el-button>
      </div>
      <span class="text-count">{{ tootMax - status.length }}</span>
      <el-button @click="closeConfirm(close)">{{ $t('modals.new_toot.cancel') }}</el-button>
      <el-button type="primary" @click="toot" v-loading="blockSubmit">{{ $t('modals.new_toot.toot') }}</el-button>
      <div class="clearfix"></div>
    </div>
  </el-dialog>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { clipboard } from 'electron'
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
    ...mapState('TimelineSpace/Modals/NewToot', {
      replyToId: (state) => {
        if (state.replyToMessage !== null) {
          return state.replyToMessage.id
        } else {
          return null
        }
      },
      attachedMedias: state => state.attachedMedias,
      attachedMediaId: state => state.attachedMediaId,
      blockSubmit: state => state.blockSubmit,
      visibility: state => state.visibility,
      sensitive: state => state.sensitive,
      visibilityIcon: (state) => {
        switch (state.visibility) {
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
    ...mapState('TimelineSpace', {
      tootMax: state => state.tootMax
    }),
    ...mapGetters('TimelineSpace/Modals/NewToot', [
      'hashtagInserting'
    ]),
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
    },
    pinedHashtag: {
      get () {
        return this.$store.state.TimelineSpace.Modals.NewToot.pinedHashtag
      },
      set (value) {
        this.$store.commit('TimelineSpace/Modals/NewToot/changePinedHashtag', value)
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
    async toot () {
      if (!this.newTootModal) {
        return
      }
      if (this.status.length <= 0 || this.status.length >= 500) {
        return this.$message({
          message: this.$t('validation.new_toot.toot_length', {min: 1, max: 500}),
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
            message: this.$t('validation.new_toot.attach_length', {max: 4}),
            type: 'error'
          })
        }
        form = Object.assign(form, {
          media_ids: this.attachedMedias.map((m) => { return m.id })
        })
      }

      const status = await this.$store.dispatch('TimelineSpace/Modals/NewToot/postToot', form)
        .catch(() => {
          this.$message({
            message: this.$t('message.toot_error'),
            type: 'error'
          })
        })
      this.$store.dispatch('TimelineSpace/Modals/NewToot/updateHashtags', status.tags)
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
          message: this.$t('validation.new_toot.attach_image'),
          type: 'error'
        })
        return
      }
      this.updateImage(file)
    },
    onPaste (e) {
      const mimeTypes = clipboard.availableFormats().filter(type => type.startsWith('image'))
      if (mimeTypes.length === 0) {
        return
      }
      e.preventDefault()
      const image = clipboard.readImage()
      let data
      if (/^image\/jpe?g$/.test(mimeTypes[0])) {
        data = image.toJPEG(100)
      } else {
        data = image.toPNG()
      }
      const file = new File([data], 'clipboard.picture', { type: mimeTypes[0] })
      this.updateImage(file)
    },
    updateImage (file) {
      this.$store.dispatch('TimelineSpace/Modals/NewToot/incrementMediaId')
      this.$store.dispatch('TimelineSpace/Modals/NewToot/uploadImage', file)
        .catch(() => {
          this.$message({
            message: this.$t('message.attach_error'),
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
    },
    closeConfirm (done) {
      if (this.status.length === 0) {
        done()
      } else {
        this.$confirm(
          this.$t('modals.new_toot.close_confirm'),
          {
            confirmButtonText: this.$t('modals.new_toot.close_confirm_ok'),
            cancelButtonText: this.$t('modals.new_toot.close_confirm_cancel')
          })
          .then(_ => {
            done()
          })
          .catch(_ => {})
      }
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
        font-family: 'Bookerly', serif;

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

      .cw-text {
        font-weight: 800;
        line-height: 18px;
      }
    }

    .pined-hashtag {
      float: left;
      margin-left: 8px;
    }

    .clickable {
      color: #909399;
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
