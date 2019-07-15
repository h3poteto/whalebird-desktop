<template>
  <div class="poll">
    <ul class="poll-list">
      <li class="poll-option" v-for="(option, id) in polls" v-bind:key="id">
        <el-radio :disabled="true" :label="id">
          <el-input :placeholder="`choice ${id}`" v-model="polls[id]" size="small"></el-input>
          <el-button class="remove-poll" type="text" @click="removePoll(id)" size="small"><icon name="times"></icon></el-button>
        </el-radio>
      </li>
    </ul>
    <el-button class="add-poll" type="info" size="small" @click="addPoll" plain>Add a choice</el-button>
  </div>
</template>

<script>
export default {
  name: 'poll',
  data() {
    return {
      polls: ['', '']
    }
  },
  methods: {
    addPoll() {
      this.polls.push('')
    },
    removePoll(id) {
      this.polls.splice(id, 1)
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
