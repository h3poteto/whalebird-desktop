<template>
  <div id="login">
    <el-button type="primary" @click="login">Login</el-button>
  </div>
</template>

<script>
export default {
  name: 'login',
  created () {
    this.$store.dispatch('Login/checkToken')
      .catch(() => {
        this.$message({
          message: 'Please login',
          type: 'error'
        })
      })
      .then(() => {
        // TODO: redirect to home timeline
        console.log('ok')
        this.$router.push({ path: '/timelinespace' })
      })
  },
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
