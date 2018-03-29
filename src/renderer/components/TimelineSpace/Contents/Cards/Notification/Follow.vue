<template>
  <div class="follow" tabIndex="0">
    <div class="action">
      <div class="action-mark">
        <icon name="user-plus" scale="0.7"></icon>
      </div>
      <div class="action-detail">
        <span class="bold">{{ username(message.account) }}</span> is now following you
      </div>
      <div class="action-icon">
        <img :src="message.account.avatar" />
      </div>
    </div>
    <div class="clearfix"></div>
    <div class="fill-line"></div>
  </div>
</template>

<script>
export default {
  name: 'follow',
  props: ['message'],
  methods: {
    username (account) {
      if (account.display_name !== '') {
        return account.display_name
      } else {
        return account.username
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.fill-line {
  height: 1px;
  background-color: #f2f6fc;
  margin: 4px 0 0;
}

.bold {
  font-weight: bold;
}

.follow {
  padding: 8px 0 0 16px;
  background-color: #ffffff;

  .action {
    margin-right: 8px;

    .action-mark {
      color: #409eff;
      float: left;
      width: 32px;
      text-align: right;
    }

    .action-detail {
      margin-left: 10px;
      font-size: 14px;
      float: left;
    }

    .action-icon {
      width: 100%;
      text-align: right;

      img {
        width: 16px;
        height: 16px;
        border-radius: 2px;
      }
    }
  }
}

.follow:focus {
  outline: 0;
  background-color: #f2f6fc;
}
</style>
