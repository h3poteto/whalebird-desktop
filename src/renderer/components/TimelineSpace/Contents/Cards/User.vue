<template>
<div class="user" @click="openUser(user)">
  <div class="icon">
    <img :src="user.avatar" />
  </div>
  <div class="name">
    <div class="username">
      {{ username(user) }}
    </div>
    <div class="acct">
      @{{ user.acct }}
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'user',
  props: [ 'user' ],
  methods: {
    username (account) {
      if (account.display_name !== '') {
        return account.display_name
      } else {
        return account.username
      }
    },
    openUser (account) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openAccountComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/changeAccount', account)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
    }
  }
}
</script>

<style lang="scss" scoped>
.user {
  display: flex;
  box-sizing: border-box;
  padding: 4px 12px 8px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;

  .icon {
    display: inline-block;

    img {
      width: 36px;
      height: 36px;
      border-radius: 4px;
    }
  }

  .name {
    display: inline-block;
    padding-left: 8px;

    .acct {
      color: #909399;
    }

    div {
      width: auto;
      word-wrap: break-word;
    }
  }
}
</style>
