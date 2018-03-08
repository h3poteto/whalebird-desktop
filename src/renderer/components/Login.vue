<template>
  <div id="login">
    <el-button type="primary" @click="login">Login</el-button>
  </div>
</template>

<script>
export default {
  name: 'login',
  methods: {
    login () {
      this.$store.dispatch('Login/fetchLogin')
        .then((url) => {
          this.$router.push({ path: '/authorize' })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
#login {
  text-align: center;
}
</style>
