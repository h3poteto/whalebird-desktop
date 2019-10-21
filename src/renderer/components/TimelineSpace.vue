<template>
  <div
    id="timeline_space"
    v-loading="loading"
    :element-loading-text="$t('message.loading')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    v-shortkey="shortcutEnabled ? { help: ['shift', '?'] } : {}"
    @shortkey="handleKey"
  >
    <side-menu></side-menu>
    <div :class="collapse ? 'page-narrow' : 'page'">
      <header class="header" style="-webkit-app-region: drag;">
        <header-menu></header-menu>
      </header>
      <contents></contents>
    </div>
    <modals></modals>
    <receive-drop v-show="droppableVisible"></receive-drop>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import SideMenu from './TimelineSpace/SideMenu'
import HeaderMenu from './TimelineSpace/HeaderMenu'
import Contents from './TimelineSpace/Contents'
import Modals from './TimelineSpace/Modals'
import Mousetrap from 'mousetrap'
import ReceiveDrop from './TimelineSpace/ReceiveDrop'
import { AccountLoadError } from '@/errors/load'
import { TimelineFetchError } from '@/errors/fetch'

export default {
  name: 'timeline-space',
  components: { SideMenu, HeaderMenu, Modals, Contents, ReceiveDrop },
  data() {
    return {
      dropTarget: null,
      droppableVisible: false
    }
  },
  computed: {
    ...mapState({
      loading: state => state.TimelineSpace.loading,
      collapse: state => state.TimelineSpace.SideMenu.collapse
    }),
    ...mapGetters('TimelineSpace/Modals', ['modalOpened']),
    shortcutEnabled: function() {
      return !this.modalOpened
    }
  },
  async created() {
    this.$store.dispatch('TimelineSpace/Contents/SideBar/close')
    await this.initialize().finally(() => {
      this.$store.commit('GlobalHeader/updateChanging', false)
    })
  },
  mounted() {
    window.addEventListener('dragenter', this.onDragEnter)
    window.addEventListener('dragleave', this.onDragLeave)
    window.addEventListener('dragover', this.onDragOver)
    window.addEventListener('drop', this.handleDrop)
    Mousetrap.bind(['command+t', 'ctrl+t'], () => {
      this.$store.commit('TimelineSpace/Modals/Jump/changeModal', true)
    })
  },
  beforeDestroy() {
    window.removeEventListener('dragenter', this.onDragEnter)
    window.removeEventListener('dragleave', this.onDragLeave)
    window.removeEventListener('dragover', this.onDragOver)
    window.removeEventListener('drop', this.handleDrop)
    this.$store.dispatch('TimelineSpace/stopStreamings')
    this.$store.dispatch('TimelineSpace/unbindStreamings')
  },
  methods: {
    async clear() {
      this.$store.dispatch('TimelineSpace/unbindStreamings')
      await this.$store.dispatch('TimelineSpace/clearAccount')
      this.$store.dispatch('TimelineSpace/clearContentsTimelines')
      await this.$store.dispatch('TimelineSpace/removeShortcutEvents')
      await this.$store.dispatch('TimelineSpace/clearUnread')
      return 'clear'
    },
    async initialize() {
      await this.clear()

      try {
        await this.$store.dispatch('TimelineSpace/initLoad', this.$route.params.id)
      } catch (err) {
        if (err instanceof AccountLoadError) {
          this.$message({
            message: this.$t('message.account_load_error'),
            type: 'error'
          })
        } else if (err instanceof TimelineFetchError) {
          this.$message({
            message: this.$t('message.timeline_fetch_error'),
            type: 'error'
          })
        }
      }

      await this.$store.dispatch('TimelineSpace/prepareSpace')
    },
    handleDrop(e) {
      e.preventDefault()
      e.stopPropagation()
      this.droppableVisible = false
      if (e.dataTransfer.files.item(0) === null || e.dataTransfer.files.item(0) === undefined) {
        return false
      }
      const file = e.dataTransfer.files.item(0)
      if (!file.type.includes('image') && !file.type.includes('video')) {
        this.$message({
          message: this.$t('validation.new_toot.attach_image'),
          type: 'error'
        })
        return false
      }
      this.$store.dispatch('TimelineSpace/Modals/NewToot/openModal')
      this.$store.dispatch('TimelineSpace/Modals/NewToot/incrementMediaCount')
      this.$store.dispatch('TimelineSpace/Modals/NewToot/uploadImage', file).catch(() => {
        this.$message({
          message: this.$t('message.attach_error'),
          type: 'error'
        })
      })
      return false
    },
    onDragEnter(e) {
      if (e.dataTransfer.types.indexOf('Files') >= 0) {
        this.dropTarget = e.target
        this.droppableVisible = true
      }
    },
    onDragLeave(e) {
      if (e.target === this.dropTarget) {
        this.droppableVisible = false
      }
    },
    onDragOver(e) {
      e.preventDefault()
    },
    handleKey(event) {
      switch (event.srcKey) {
        case 'help':
          this.$store.commit('TimelineSpace/Modals/Shortcut/changeModal', true)
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#timeline_space {
  height: 100%;
}
.page {
  margin-left: 180px;
  height: 100%;
  box-sizing: border-box;

  .header {
    width: calc(100% - 180px);
    position: fixed;
    top: 0;
    height: 48px;
    border-bottom: solid 1px var(--theme-border-color);
  }
}

.page-narrow {
  margin-left: 64px;
  height: 100%;
  box-sizing: border-box;

  .header {
    width: calc(100% - 64px);
    position: fixed;
    top: 0;
    height: 48px;
    border-bottom: solid 1px var(--theme-border-color);
  }
}

.with-global-header {
  .page .header {
    width: calc(100% - 245px);
  }

  .page-narrow .header {
    width: calc(100% - 65px - 64px);
  }
}
</style>
