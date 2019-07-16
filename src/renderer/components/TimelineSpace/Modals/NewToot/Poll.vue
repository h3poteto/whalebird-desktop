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
  </div>
</template>

<script>
export default {
  name: 'poll',
  props: ['value'],
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
