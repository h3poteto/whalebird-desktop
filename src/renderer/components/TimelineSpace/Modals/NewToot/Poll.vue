<template>
  <div class="poll">
    <ul class="poll-list">
      <li class="poll-option" v-for="(option, id) in polls" v-bind:key="id">
        <el-radio :disabled="true" :label="id">
          <el-input :placeholder="`choice ${id}`" :modelValue="option" @input="polls[id] = $event" size="small"></el-input>
          <el-button class="remove-poll" type="text" @click="removePoll(id)" size="small"><font-awesome-icon icon="xmark" /></el-button>
        </el-radio>
      </li>
    </ul>
    <el-button class="add-poll" type="info" size="small" @click="addPoll" plain>{{ $t('modals.new_toot.poll.add_choice') }}</el-button>
    <el-select :modelValue="expire" @change="$emit('update:expire', $event)" size="small" value-key="value">
      <el-option v-for="exp in expiresList" :key="exp.value" :label="exp.label" :value="exp"> </el-option>
    </el-select>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs, reactive, watch } from 'vue'
import { useI18next } from 'vue3-i18next'

type Expire = {
  label: string
  value: number
}

export default defineComponent({
  name: 'poll',
  props: {
    polls: {
      type: Array as PropType<Array<String>>,
      default: []
    },
    expire: {
      type: Object as PropType<Expire>,
      required: true
    }
  },
  setup(props, ctx) {
    const i18n = useI18next()
    const { expire, polls } = toRefs(props)
    const expiresList = reactive<Array<Expire>>([
      {
        label: i18n.t('modals.new_toot.poll.expires.5_minutes'),
        value: 60 * 5
      },
      {
        label: i18n.t('modals.new_toot.poll.expires.30_minutes'),
        value: 60 * 30
      },
      {
        label: i18n.t('modals.new_toot.poll.expires.1_hour'),
        value: 3600
      },
      {
        label: i18n.t('modals.new_toot.poll.expires.6_hours'),
        value: 3600 * 6
      },
      {
        label: i18n.t('modals.new_toot.poll.expires.1_day'),
        value: 3600 * 24
      },
      {
        label: i18n.t('modals.new_toot.poll.expires.3_days'),
        value: 3600 * 24 * 3
      },
      {
        label: i18n.t('modals.new_toot.poll.expires.7_days'),
        value: 3600 * 24 * 7
      }
    ])

    const addPoll = () => {
      ctx.emit('addPoll')
    }
    const removePoll = (id: number) => {
      ctx.emit('removePoll', id)
    }

    watch(expire, (newExpire, _old) => {
      ctx.emit('update:expire', newExpire)
    })
    watch(
      polls,
      (newPolls, _old) => {
        ctx.emit('update:polls', newPolls)
      },
      { deep: true }
    )

    return {
      polls,
      expire,
      expiresList,
      addPoll,
      removePoll
    }
  }
})
</script>

<style lang="scss" scoped>
.poll {
  border-top: 1px solid #ebebeb;

  .poll-list {
    list-style: none;
    padding-left: 16px;

    .poll-option {
      line-height: 38px;

      .remove-poll {
        margin-left: 4px;
      }
    }
  }

  .add-poll {
    margin: 0 4px 0 40px;
  }
}

.poll :deep(.el-input__inner) {
  box-shadow: none;
}
</style>
