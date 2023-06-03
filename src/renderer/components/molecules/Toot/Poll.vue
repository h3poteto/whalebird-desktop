<template>
  <div class="poll">
    <template v-if="poll">
      <ul class="poll-list">
        <template v-if="poll.voted">
          <li class="voted" v-for="(option, id) in poll.options" v-bind:key="id">
            <span class="progress-bar" :style="progress(percentage(option.votes_count, poll.votes_count))"></span>
            <label class="text">
              <span class="percentage">{{ percentage(option.votes_count, poll.votes_count) }}%</span>
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
      <el-button v-if="!poll.voted" type="success" size="small" @click="vote" :disabled="pollRadio === null">{{
        $t('cards.toot.poll.vote')
      }}</el-button>
      <el-button v-else link @click="refresh">{{ $t('cards.toot.poll.refresh') }}</el-button>
      <span class="votes-count">{{ poll.votes_count }} {{ $t('cards.toot.poll.votes_count') }},</span>
      <span class="until">{{ parseDatetime(poll.expires_at, now) }}</span>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, toRefs, PropType } from 'vue'
import { Entity } from 'megalodon'
import { useTranslation } from 'i18next-vue'
import { useStore } from '@/store'
import moment from 'moment'
import TimeFormat from '~/src/constants/timeFormat'

export default defineComponent({
  props: {
    poll: {
      type: Object as PropType<Entity.Poll>,
      default: null
    }
  },
  setup(props, ctx) {
    const store = useStore()
    const { t } = useTranslation()
    const { poll } = toRefs(props)

    const timeFormat = computed(() => store.state.App.timeFormat)
    const language = computed(() => store.state.App.language)

    const pollRadio = ref<string | null>(null)
    const now = ref(Date.now())

    const parseDatetime = (datetime: string | null, epoch: number) => {
      switch (timeFormat.value) {
        case TimeFormat.Relative.value:
          moment.locale(language.value)
          return t('cards.toot.poll.left', {
            datetime: moment(datetime).from(epoch)
          })
        default:
          return t('cards.toot.poll.until', {
            datetime: moment(datetime).format('YYYY-MM-DD HH:mm:ss')
          })
      }
    }
    const percentage = (option_votes: number | null, poll_votes: number) => {
      if (poll_votes === 0) {
        return '0'
      }
      if (!option_votes) {
        return '0'
      }
      return ((option_votes * 100) / poll_votes).toFixed(0)
    }
    const vote = () => {
      if (pollRadio !== null) {
        ctx.emit('vote', [pollRadio.value])
      }
    }
    const progress = (percent: string) => {
      return `width: ${percent}%`
    }
    const refresh = () => {
      ctx.emit('refresh', poll.value.id)
    }

    return {
      pollRadio,
      now,
      parseDatetime,
      percentage,
      vote,
      progress,
      refresh,
      $t: t
    }
  }
})
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

      .el-radio {
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
