<template>
<div class="poll">
  <template v-if="poll">
    <ul class="poll-list">
      <template v-if="poll.voted">
        <li class="voted" v-for="(option, id) in poll.options" v-bind:key="id">
          <span class="progress-bar" :style="progress(option.votes_count * 100 / poll.votes_count)"></span>
          <label class="text">
            <span class="percentage">{{ option.votes_count * 100 / poll.votes_count }}%</span>
            <span>{{ option.title }}</span>
          </label>
        </li>
      </template>
      <template v-else>
        <li class="not-voted" v-for="(option, id) in poll.options" v-bind:key="id">
          <el-radio v-model="pollRadio" :label="id">{{ option.title }}</el-radio>
        </li>
      </template>
    </ul>
    <el-button v-if="!poll.voted" type="success" size="small" @click="vote" :disabled="pollRadio === null">{{ $t('cards.toot.poll.vote') }}</el-button>
    <el-button v-else type="text" @click="refresh">{{ $t('cards.toot.poll.refresh') }}</el-button>
    <span class="votes-count">{{ poll.votes_count }} {{ $t('cards.toot.poll.votes_count') }},</span>
    <span class="until">{{ parseDatetime(poll.expires_at, now) }}</span>
  </template>
</div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import TimeFormat from '~/src/constants/timeFormat'

export default {
  data() {
    return {
      pollRadio: null,
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
          return this.$t('cards.toot.poll.until', { datetime: moment(datetime).format('YYYY-MM-DD HH:mm:ss') })
        case TimeFormat.Relative.value:
          moment.locale(this.language)
          return this.$t('cards.toot.poll.left', { datetime: moment(datetime).from(epoch) })
      }
    },
    vote() {
      if (this.pollRadio !== null) {
        this.$emit('vote', [this.pollRadio])
      }
    },
    progress(percent) {
      return `width: ${percent}%`
    },
    refresh() {
      this.$emit('refresh', this.poll.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.poll {
  .poll-list {
    list-style: none;
    padding-left: 16px;

    li {
      position: relative;
      margin: 4px 0;
      line-height: 32px;

      .el-radio /deep/ {
        color: var(--theme-regular-color);
      }
    }

    .voted {
      max-width: 200px;

      .progress-bar {
        position: absolute;
        display: inline-block;
        height: 100%;
        background-color: #409eff;
        border-radius: 4px;
      }

      .text {
        position: relative;
        display: inline-block;
        padding-left: 8px;

        .percentage {
          font-weight: bold;
        }
      }
    }
  }

  .votes-count {
    display: inline-block;
    padding-left: 8px;
  }
}
</style>
