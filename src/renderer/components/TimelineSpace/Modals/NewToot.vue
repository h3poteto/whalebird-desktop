<template>
  <el-dialog
    :title="$t('modals.new_toot.title')"
    :visible.sync="newTootModal"
    v-if="newTootModal"
    :before-close="closeConfirm"
    width="600px"
    class="new-toot-modal"
    ref="dialog"
  >
    <el-form v-on:submit.prevent="toot" role="form">
      <Quote :message="quoteToMessage" :displayNameStyle="displayNameStyle" v-if="quoteToMessage !== null" ref="quote"></Quote>
      <div class="spoiler" v-if="showContentWarning" ref="spoiler">
        <div class="el-input">
          <input type="text" class="el-input__inner" :placeholder="$t('modals.new_toot.cw')" v-model="spoiler" v-shortkey.avoid />
        </div>
      </div>
      <Status
        v-model="status"
        :opened="newTootModal"
        :fixCursorPos="hashtagInserting"
        :height="statusHeight"
        @paste="onPaste"
        @toot="toot"
        @pickerOpened="innerElementOpened"
        @suggestOpened="innerElementOpened"
      />
    </el-form>
    <Poll
      v-if="openPoll"
      v-model="polls"
      @addPoll="addPoll"
      @removePoll="removePoll"
      :defaultExpire="pollExpire"
      @changeExpire="changeExpire"
      ref="poll"
    ></Poll>
    <div class="preview" ref="preview">
      <div class="image-wrapper" v-for="media in attachedMedias" v-bind:key="media.id">
        <img :src="media.preview_url" class="preview-image" />
        <el-button type="text" @click="removeAttachment(media)" class="remove-image"><icon name="times-circle"></icon></el-button>
        <textarea
          maxlength="420"
          class="image-description"
          :placeholder="$t('modals.new_toot.description')"
          :value="mediaDescriptions[media.id]"
          @input="updateDescription(media.id, $event.target.value)"
          v-shortkey.avoid
          role="textbox"
          contenteditable="true"
          aria-multiline="true"
        >
        </textarea>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <div class="upload-image">
        <el-button size="small" type="text" @click="selectImage" :title="$t('modals.new_toot.footer.add_image')">
          <icon name="camera"></icon>
        </el-button>
        <input name="image" type="file" class="image-input" ref="image" @change="onChangeImage" :key="attachedMediaId" />
      </div>
      <div class="poll">
        <el-button size="small" type="text" @click="togglePollForm" :title="$t('modals.new_toot.footer.poll')">
          <icon name="poll"></icon>
        </el-button>
      </div>
      <div class="privacy">
        <el-dropdown trigger="click" @command="changeVisibility">
          <el-button size="small" type="text" :title="$t('modals.new_toot.footer.change_visibility')">
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
        <el-button
          size="small"
          type="text"
          @click="changeSensitive"
          :title="$t('modals.new_toot.footer.change_sensitive')"
          :aria-pressed="sensitive"
        >
          <icon name="eye-slash" v-show="!sensitive"></icon>
          <icon name="eye" v-show="sensitive"></icon>
        </el-button>
      </div>
      <div class="content-warning">
        <el-button
          size="small"
          type="text"
          @click="toggleContentWarning()"
          :title="$t('modals.new_toot.footer.add_cw')"
          :class="showContentWarning ? '' : 'clickable'"
          :aria-pressed="showContentWarning"
        >
          <span class="cw-text">CW</span>
        </el-button>
      </div>
      <div class="pined-hashtag">
        <el-button
          size="small"
          type="text"
          @click="pinedHashtag = !pinedHashtag"
          :title="$t('modals.new_toot.footer.pined_hashtag')"
          :class="pinedHashtag ? '' : 'clickable'"
          :aria-pressed="pinedHashtag"
        >
          <icon name="hashtag"></icon>
        </el-button>
      </div>
      <div class="info">
        <img src="../../../assets/images/loading-spinner-wide.svg" v-show="loading" class="loading" />
        <span class="text-count">{{ tootMax - status.length }}</span>

        <el-button class="toot-action" size="small" @click="closeConfirm(close)">{{ $t('modals.new_toot.cancel') }}</el-button>
        <el-button class="toot-action" size="small" type="primary" @click="toot" :loading="blockSubmit">{{
          $t('modals.new_toot.toot')
        }}</el-button>
      </div>
      <div class="clearfix"></div>
    </div>
    <resize-observer @notify="handleResize" />
  </el-dialog>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Visibility from '~/src/constants/visibility'
import Status from './NewToot/Status'
import Poll from './NewToot/Poll'
import Quote from './NewToot/Quote'
import { NewTootTootLength, NewTootAttachLength, NewTootModalOpen, NewTootBlockSubmit, NewTootPollInvalid } from '@/errors/validations'
import { Event } from '~/src/renderer/components/event'

export default {
  name: 'new-toot',
  components: {
    Status,
    Poll,
    Quote
  },
  data() {
    return {
      status: '',
      spoiler: '',
      showContentWarning: false,
      visibilityList: Visibility,
      openPoll: false,
      polls: [],
      pollExpire: {
        label: this.$t('modals.new_toot.poll.expires.1_day'),
        value: 3600 * 24
      },
      statusHeight: 240
    }
  },
  computed: {
    ...mapState('TimelineSpace/Modals/NewToot', {
      replyToId: state => {
        if (state.replyToMessage !== null) {
          return state.replyToMessage.id
        } else {
          return null
        }
      },
      quoteToMessage: state => state.quoteToMessage,
      attachedMedias: state => state.attachedMedias,
      attachedMediaId: state => state.attachedMediaId,
      mediaDescriptions: state => state.mediaDescriptions,
      blockSubmit: state => state.blockSubmit,
      visibility: state => state.visibility,
      sensitive: state => state.sensitive,
      initialStatus: state => state.initialStatus,
      initialSpoiler: state => state.initialSpoiler,
      visibilityIcon: state => {
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
      },
      loading: state => state.loading
    }),
    ...mapState('TimelineSpace', {
      tootMax: state => state.tootMax
    }),
    ...mapState('App', {
      displayNameStyle: state => state.displayNameStyle
    }),
    ...mapGetters('TimelineSpace/Modals/NewToot', ['hashtagInserting']),
    newTootModal: {
      get() {
        return this.$store.state.TimelineSpace.Modals.NewToot.modalOpen
      },
      set(value) {
        if (value) {
          this.$store.dispatch('TimelineSpace/Modals/NewToot/openModal')
        } else {
          this.$store.dispatch('TimelineSpace/Modals/NewToot/closeModal')
        }
      }
    },
    pinedHashtag: {
      get() {
        return this.$store.state.TimelineSpace.Modals.NewToot.pinedHashtag
      },
      set(value) {
        this.$store.commit('TimelineSpace/Modals/NewToot/changePinedHashtag', value)
      }
    }
  },
  created() {
    this.$store.dispatch('TimelineSpace/Modals/NewToot/setupLoading')
  },
  mounted() {
    Event.$on('image-uploaded', () => {
      if (this.$refs.preview) {
        this.statusHeight = this.statusHeight - this.$refs.preview.offsetHeight
      }
    })
  },
  watch: {
    newTootModal: function (newState, oldState) {
      if (!oldState && newState) {
        this.showContentWarning = this.initialSpoiler
        this.status = this.initialStatus
        this.spoiler = this.initialSpoiler
      }
    }
  },
  methods: {
    close() {
      this.filteredAccount = []
      const spoilerHeight = this.$refs.spoiler ? this.$refs.spoiler.offsetHeight : 0
      this.showContentWarning = false
      this.spoiler = ''
      this.statusHeight = this.statusHeight + spoilerHeight
      const pollHeight = this.$refs.poll ? this.$refs.poll.$el.offsetHeight : 0
      this.openPoll = false
      this.polls = []
      this.pollExpire = {
        label: this.$t('modals.new_toot.poll.expires.1_day'),
        value: 3600 * 24
      }
      this.statusHeight = this.statusHeight + pollHeight
      const quoteHeight = this.$refs.quote ? this.$refs.quote.$el.offsetHeight : 0
      this.statusHeight = this.statusHeight + quoteHeight
      const attachmentHeight = this.$refs.preview ? this.$refs.preview.offsetHeight : 0
      this.statusHeight = this.statusHeight + attachmentHeight
      this.$store.dispatch('TimelineSpace/Modals/NewToot/resetMediaCount')
      this.$store.dispatch('TimelineSpace/Modals/NewToot/closeModal')
    },
    async toot() {
      const form = {
        status: this.status,
        spoiler: this.spoiler,
        polls: this.polls,
        pollExpireSeconds: this.pollExpire.value
      }

      try {
        const status = await this.$store.dispatch('TimelineSpace/Modals/NewToot/postToot', form)
        this.$store.dispatch('TimelineSpace/Modals/NewToot/updateHashtags', status.tags)
        this.close()
      } catch (err) {
        console.error(err)
        if (err instanceof NewTootTootLength) {
          this.$message({
            message: this.$t('validation.new_toot.toot_length', { min: 1, max: this.tootMax }),
            type: 'error'
          })
        } else if (err instanceof NewTootAttachLength) {
          this.$message({
            message: this.$t('validation.new_toot.attach_length', { max: 4 }),
            type: 'error'
          })
        } else if (err instanceof NewTootPollInvalid) {
          this.$message({
            message: this.$t('validation.new_toot.poll_invalid'),
            type: 'error'
          })
        } else if (err instanceof NewTootModalOpen || err instanceof NewTootBlockSubmit) {
          // Nothing
        } else {
          this.$message({
            message: this.$t('message.toot_error'),
            type: 'error'
          })
        }
      }
    },
    selectImage() {
      this.$refs.image.click()
    },
    onChangeImage(e) {
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
    onPaste(e) {
      const mimeTypes = window.clipboard.availableFormats().filter(type => type.startsWith('image'))
      if (mimeTypes.length === 0) {
        return
      }
      e.preventDefault()
      const image = window.clipboard.readImage()
      let data
      if (/^image\/jpe?g$/.test(mimeTypes[0])) {
        data = image.toJPEG(100)
      } else {
        data = image.toPNG()
      }
      const file = new File([data], 'clipboard.picture', { type: mimeTypes[0] })
      this.updateImage(file)
    },
    updateImage(file) {
      this.$store.dispatch('TimelineSpace/Modals/NewToot/incrementMediaCount')
      this.$store
        .dispatch('TimelineSpace/Modals/NewToot/uploadImage', file)
        .then(() => {
          this.statusHeight = this.statusHeight - this.$refs.preview.offsetHeight
        })
        .catch(err => {
          if (err instanceof NewTootAttachLength) {
            this.$message({
              message: this.$t('validation.new_toot.attach_length', { max: 4 }),
              type: 'error'
            })
          } else {
            this.$message({
              message: this.$t('message.attach_error'),
              type: 'error'
            })
          }
        })
    },
    removeAttachment(media) {
      const previousHeight = this.$refs.preview.offsetHeight
      this.$store.dispatch('TimelineSpace/Modals/NewToot/removeMedia', media).then(() => {
        this.statusHeight = this.statusHeight + previousHeight
      })
    },
    changeVisibility(level) {
      this.$store.commit('TimelineSpace/Modals/NewToot/changeVisibilityValue', level)
    },
    changeSensitive() {
      this.$store.commit('TimelineSpace/Modals/NewToot/changeSensitive', !this.sensitive)
    },
    closeConfirm(done) {
      if (this.status.length === 0) {
        done()
      } else {
        this.$confirm(this.$t('modals.new_toot.close_confirm'), {
          confirmButtonText: this.$t('modals.new_toot.close_confirm_ok'),
          cancelButtonText: this.$t('modals.new_toot.close_confirm_cancel')
        })
          .then(_ => {
            done()
          })
          .catch(_ => {})
      }
    },
    updateDescription(id, value) {
      this.$store.commit('TimelineSpace/Modals/NewToot/updateMediaDescription', { id: id, description: value })
    },
    async togglePollForm() {
      const previousHeight = this.$refs.poll ? this.$refs.poll.$el.offsetHeight : 0
      const toggle = () => {
        this.openPoll = !this.openPoll
        if (this.openPoll) {
          this.polls = ['', '']
        } else {
          this.polls = []
        }
      }
      await toggle()
      if (this.openPoll) {
        this.statusHeight = this.statusHeight - this.$refs.poll.$el.offsetHeight
      } else {
        this.statusHeight = this.statusHeight + previousHeight
      }
    },
    async addPoll() {
      const previousPollHeight = this.$refs.poll.$el.offsetHeight
      await this.polls.push('')
      const diff = this.$refs.poll.$el.offsetHeight - previousPollHeight
      this.statusHeight = this.statusHeight - diff
    },
    async removePoll(id) {
      const previousPollHeight = this.$refs.poll.$el.offsetHeight
      await this.polls.splice(id, 1)
      const diff = previousPollHeight - this.$refs.poll.$el.offsetHeight
      this.statusHeight = this.statusHeight + diff
    },
    changeExpire(obj) {
      this.pollExpire = obj
    },
    async toggleContentWarning() {
      const previousHeight = this.$refs.spoiler ? this.$refs.spoiler.offsetHeight : 0
      await (this.showContentWarning = !this.showContentWarning)
      if (this.showContentWarning) {
        this.statusHeight = this.statusHeight - this.$refs.spoiler.offsetHeight
      } else {
        this.statusHeight = this.statusHeight + previousHeight
      }
    },
    handleResize(event) {
      // Ignore when the modal height already reach window height.
      const vHeight = this.$refs.dialog.$el.firstChild.style.marginTop
      const marginTop = (document.documentElement.clientHeight / 100) * parseInt(vHeight)
      const limitHeight = document.documentElement.clientHeight - marginTop - 80
      if (this.$refs.dialog.$el.firstChild.offsetHeight >= limitHeight) {
        return
      }
      // When emoji picker is opened, resize event has to be stopped.
      const style = this.$refs.dialog.$el.firstChild.style
      if (style.overflow === '' || style.overflow === 'hidden') {
        const pollHeight = this.$refs.poll ? this.$refs.poll.$el.offsetHeight : 0
        const spoilerHeight = this.$refs.spoiler ? this.$refs.spoiler.offsetHeight : 0
        const quoteHeight = this.$refs.quote ? this.$refs.quote.$el.offsetHeight : 0
        const headerHeight = 54
        const footerHeight = 63
        this.statusHeight =
          event.height - footerHeight - headerHeight - this.$refs.preview.offsetHeight - pollHeight - spoilerHeight - quoteHeight
      }
    },
    innerElementOpened(open) {
      if (open) {
        this.$refs.dialog.$el.firstChild.style.overflow = 'visible'
      } else {
        this.$refs.dialog.$el.firstChild.style.overflow = 'hidden'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.new-toot-modal /deep/ {
  .el-dialog {
    background-color: var(--theme-selected-background-color);
    overflow: hidden;
    resize: both;
    padding-bottom: 20px;
    max-height: calc(100% - 15vh - 80px);
    max-width: 95%;
  }

  .el-dialog__header {
    background-color: #4a5664;

    .el-dialog__title {
      color: #ebeef5;
    }
  }

  .el-dialog__body {
    padding: 0;

    .el-input__inner {
      background-color: var(--theme-background-color);
      color: var(--theme-primary-color);
      border: 1px solid var(--theme-border-color);
    }

    .spoiler {
      box-sizing: border-box;
      padding: 4px 0;
      background-color: #4a5664;

      input {
        border-radius: 0;

        &::placeholder {
          color: #c0c4cc;
        }
      }
    }

    .preview {
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      .image-wrapper {
        position: relative;
        flex: 1 1 0;
        min-width: 10%;
        height: 150px;
        margin: 4px;

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 0;
          border-radius: 8px;
        }

        .image-description {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          box-sizing: border-box;
          border: 0;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0, rgba(0, 0, 0, 0.35) 80%, transparent);
          font-size: var(--font-base-size);
          color: #fff;
          opacity: 1;
          resize: none;
          overflow: scroll;

          &::placeholder {
            color: #c0c4cc;
          }
        }

        .remove-image {
          position: absolute;
          top: 2px;
          left: 2px;
          padding: 0;
          cursor: pointer;
          font-size: 1.5rem;

          .fa-icon {
            font-size: 0.9rem;
            width: auto;
            height: 1em;
            max-width: 100%;
            max-height: 100%;
          }
        }
      }
    }
  }

  .el-dialog__footer {
    background-color: var(--theme-selected-background-color);
    font-size: var(--base-font-size);
    padding-bottom: 0;

    .upload-image {
      text-align: left;
      float: left;

      .image-input {
        display: none;
      }
    }

    .poll {
      float: left;
      margin-left: 8px;
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

    .info {
      display: flex;
      justify-content: flex-end;
      align-items: center;

      .loading {
        width: 18px;
        margin-right: 4px;
      }

      .text-count {
        padding-right: 10px;
        color: #909399;
      }
    }

    .toot-action {
      font-size: var(--base-font-size);
      margin-top: 2px;
      margin-bottom: 2px;
    }
  }
}

.privacy-icon {
  margin-right: 4px;
}
</style>
