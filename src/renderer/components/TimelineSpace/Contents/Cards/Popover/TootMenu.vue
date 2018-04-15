<template>
<div class="toot-menu">
  <popover :name="name" :width="120" class="action-pop-over" ref="actionPopover">
    <ul class="menu-list">
      <li role="button" @click="openDetail">
        View Toot Detail
      </li>
      <li role="button" @click="openBrowser">
        Open in Browser
      </li>
    </ul>
  </popover>
</div>
</template>

<script>
import { shell } from 'electron'

export default {
  name: 'toot-menu',
  props: ['message', 'name'],
  methods: {
    openDetail () {
      this.$refs.actionPopover.visible = false
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openTootComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/TootDetail/changeToot', this.message)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
    },
    openBrowser () {
      this.$refs.actionPopover.visible = false
      shell.openExternal(this.message.url)
    }
  }
}
</script>

<style lang="scss" scoped>
.toot-menu {
  .menu-list {
    padding: 0;
    font-size: 0.8em;
    list-style-type: none;
    text-align: left;

    li {
      box-sizing: border-box;
      padding-left: 0.5em;
      padding-bottom: 0.5em;

      &:hover {
        background-color: #f2f6fc;
        cursor: pointer;
      }
    }
  }
}
</style>
