<template>
  <div class="poll">
    <ul class="poll-list">
      <li class="poll-option" v-for="(option, id) in value" v-bind:key="id">
        <el-radio :disabled="true" :label="id">
          <el-input :placeholder="`choice ${id}`" :value="value[id]" @input="value => updateOption(value, id)" size="small"></el-input>
          <el-button class="remove-poll" type="text" @click="removePoll(id)" size="small"><icon name="times"></icon></el-button>
        </el-radio>
      </li>
    </ul>
    <el-button class="add-poll" type="info" size="small" @click="addPoll" plain>{{ $t('modals.new_toot.poll.add_choice') }}</el-button>
    <el-select v-model="expiresIn" size="small" value-key="value" @change="changeExpire">
      <el-option v-for="exp in expires" :key="exp.value" :label="exp.label" :value="exp"> </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'poll',
  props: ['value', 'defaultExpire'],
  data() {
    return {
      expires: [
        {
          label: this.$t('modals.new_toot.poll.expires.5_minutes'),
          value: 60 * 5
        },
        {
          label: this.$t('modals.new_toot.poll.expires.30_minutes'),
          value: 60 * 30
        },
        {
          label: this.$t('modals.new_toot.poll.expires.1_hour'),
          value: 3600
        },
        {
          label: this.$t('modals.new_toot.poll.expires.6_hours'),
          value: 3600 * 6
        },
        {
          label: this.$t('modals.new_toot.poll.expires.1_day'),
          value: 3600 * 24
        },
        {
          label: this.$t('modals.new_toot.poll.expires.3_days'),
          value: 3600 * 24 * 3
        },
        {
          label: this.$t('modals.new_toot.poll.expires.7_days'),
          value: 3600 * 24 * 7
        }
      ],
      expiresIn: null
    }
  },
  created() {
    this.expiresIn = this.defaultExpire
  },
  methods: {
    addPoll() {
      this.$emit('addPoll')
    },
    removePoll(id) {
      this.$emit('removePoll', id)
    },
    updateOption(item, index) {
      const newValue = [...this.value.slice(0, index), item, ...this.value.slice(index + 1)]
      this.$emit('input', newValue)
    },
    changeExpire(exp) {
      this.$emit('changeExpire', exp)
    }
  }
}
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
    margin: 0 0 8px 40px;
  }
}
</style>
