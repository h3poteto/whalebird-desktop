<template>
  <el-dialog
    :visible.sync="jumpModal"
    width="440px"
    class="jump-modal">
    <el-form class="jump-form" v-on:submit.prevent="jump">
      <div class="channel">
        <input type="text" v-model="channel" placeholder="Jump to..." ref="channel" @keyup.enter.exact="jumpCurrentSelected" @keyup.down.exact="nextChannel" @keyup.up.exact="prevChannel" />
        <ul class="channel-list">
          <li v-for="c in filterdChannel" :class="c.name === selectedChannel.name ? 'channel-list-item selected' : 'channel-list-item'" @click="jump(c)" @mouseover="changeSelected(c)">{{ c.name }}</li>
        </ul>
      </div>
      <!-- Dummy form to guard submitting with enter -->
      <el-form-item class="hidden">
        <el-input></el-input>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'jump',
  computed: {
    ...mapState({
      channelList: state => state.TimelineSpace.Modals.Jump.channelList,
      selectedChannel: state => state.TimelineSpace.Modals.Jump.selectedChannel
    }),
    channel: {
      get () {
        return this.$store.state.TimelineSpace.Modals.Jump.channel
      },
      set (value) {
        this.$store.commit('TimelineSpace/Modals/Jump/updateChannel', value)
      }
    },
    filterdChannel () {
      return this.filterChannelForm()
    },
    jumpModal: {
      get () {
        return this.$store.state.TimelineSpace.Modals.Jump.modalOpen
      },
      set (value) {
        this.$store.commit('TimelineSpace/Modals/Jump/changeModal', value)
      }
    }
  },
  watch: {
    channel (newChannel, oldChannel) {
      this.$store.commit('TimelineSpace/Modals/Jump/changeSelected', this.filterChannelForm()[0])
    }
  },
  updated () {
    if (this.jumpModal) {
      this.$refs.channel.focus()
    } else {
      this.channel = ''
    }
  },
  methods: {
    filterChannelForm () {
      return this.channelList.filter((c) => {
        return c.name.toLowerCase().indexOf(this.channel.toLowerCase()) !== -1
      })
    },
    nextChannel () {
      const filterd = this.filterChannelForm()
      const i = filterd.findIndex((e) => {
        return e.name === this.selectedChannel.name
      })
      if (i !== undefined && i < (filterd.length - 1)) {
        this.$store.commit('TimelineSpace/Modals/Jump/changeSelected', filterd[i + 1])
      }
    },
    prevChannel () {
      const filterd = this.filterChannelForm()
      const i = filterd.findIndex((e) => {
        return e.name === this.selectedChannel.name
      })
      if (i !== undefined && i > 0) {
        this.$store.commit('TimelineSpace/Modals/Jump/changeSelected', filterd[i - 1])
      }
    },
    changeSelected (channel) {
      this.$store.commit('TimelineSpace/Modals/Jump/changeSelected', channel)
    },
    jumpCurrentSelected () {
      this.$store.dispatch('TimelineSpace/Modals/Jump/jumpCurrentSelected')
    },
    jump (channel) {
      this.$store.dispatch('TimelineSpace/Modals/Jump/jump', channel)
    }
  }
}
</script>

<style lang="scss" scoped>
.jump-form {
  .channel {
    input {
      font-size: 32px;
      line-height: 54px;
      width: 100%;
      outline: 0;
      border: 1px solid #dcdfe6;
      border-radius: 8px;
      padding: 8px;
      color: #303133;
      box-sizing: border-box;
    }

    .channel-list {
      list-style: none;
      font-size: 16px;
      padding: 0;

      .channel-list-item {
        padding: 4px 8px;
        border-radius: 4px;
      }

      .selected {
        background-color: #409eff;
        color: #ffffff;
      }
    }
  }

  .hidden {
    display: none;
  }
}
</style>
