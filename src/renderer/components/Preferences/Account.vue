<template>
<div id="account">
  <h2>Account</h2>
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
