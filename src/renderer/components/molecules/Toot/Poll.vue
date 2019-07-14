<template>
  <div class="poll">
    <ul class="poll-list" v-if="poll">
      <li v-for="(option, id) in poll.options" v-bind:key="id">
        <el-radio v-model="pollRadio" :label="option.title">{{ option.title }}</el-radio>
      </li>
    </ul>
    <el-button type="success">Vote</el-button>
    {{ poll.votes_count }} votes,
    until {{ parseDatetime(poll.expires_at, now) }}
  </div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import TimeFormat from '~/src/constants/timeFormat'

export default {
  data() {
    return {
      pollRadio: '',
      now: Date.now()
    }
  },
  props: {
    poll: {
      type: Object,
      default: null
    }
  },
  computed: {
    ...mapState('App', {
      timeFormat: state => state.timeFormat,
      language: state => state.language
    })
  },
  methods: {
    parseDatetime(datetime, epoch) {
      switch (this.timeFormat) {
        case TimeFormat.Absolute.value:
          return moment(datetime).format('YYYY-MM-DD HH:mm:ss')
        case TimeFormat.Relative.value:
          moment.locale(this.language)
          return moment(datetime).from(epoch)
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.poll {
  .poll-list {
    list-style: none;
    padding-left: 16px;

    li {
      margin: 4px 0;
    }
  }
}
</style>
