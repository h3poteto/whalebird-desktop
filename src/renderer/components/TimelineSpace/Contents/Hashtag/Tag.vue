<template>
  <div id="tag">
    <transition-group name="timeline" tag="div">
      <div class="tag-timeline" v-for="message in timeline" v-bind:key="message.id">
        <toot :message="message" v-on:update="updateToot" v-on:delete="deleteToot"></toot>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from '../Cards/Toot'

export default {
  name: 'tag',
  components: { Toot },
  computed: {
    ...mapState({
      timeline: state => state.TimelineSpace.Contents.Hashtag.Tag.timeline
    })
  },
  mounted () {
    this.load(this.$route.params.tag)
  },
  watch: {
    '$route': function () {
      this.load(this.$route.params.tag)
    }
  },
  methods: {
    load (tag) {
      this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/fetch', tag)
    },
    updateToot (messag) {
    },
    deleteToot (message) {
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
<style src="@/assets/timeline-transition.scss"></style>
