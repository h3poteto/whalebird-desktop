<template>
<div id="account">
  account
</div>
</template>

<script>
export default {
  name: 'account',
  created () {
    this.$store.commit('Preferences/changeActive', '2')
  }
}
</script>

<style lang="scss" scoped>
</style>
