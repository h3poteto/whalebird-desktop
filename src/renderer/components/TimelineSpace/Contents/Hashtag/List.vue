<template>
<div id="list">
  <table class="tag-list">
    <tbody>
      <tr v-for="tag in tags" v-bind:key="tag._id" @click="openTimeline(tag.tagName)">
        <td>
          {{ tag.tagName }}
        </td>
      </tr>
    </tbody>
  </table>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'list',
  computed: {
    ...mapState({
      tags: state => state.TimelineSpace.Contents.Hashtag.List.tags
    })
  },
  created () {
    this.$store.dispatch('TimelineSpace/Contents/Hashtag/List/listTags')
  },
  methods: {
    openTimeline (tag) {
      this.$router.push({ path: `/${this.$route.params.id}/hashtag/${tag}` })
    }
  }
}
</script>

<style lang="scss" scoped>
#list {
  .tag-list {
    width: 100%;

    tr,
    th,
    td {
      background-color: var(--theme-background-color);
      color: var(--theme-secondary-color);
      border-bottom: 1px solid var(--theme-border-color);
      padding: 12px 20px;
      cursor: pointer;
    }

    &:first-child {
      border-top: 1px solid var(--theme-border-color);
    }
  }
}
</style>
