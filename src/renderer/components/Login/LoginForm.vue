<template>
<div id="login_form">
  <el-form ref="loginForm" label-width="120px" label-position="top" v-on:submit.prevent="confirm" class="login-form">
    <el-form-item label="At first, let's login a mastodon instance. Please write host name which you want to login.">
      <el-input v-model="loginForm.domainName" placeholder="mastodon.social"></el-input>
    </el-form-item>
    <!-- Dummy form to guard submitting with enter -->
    <el-form-item class="hidden">
      <el-input></el-input>
    </el-form-item>
    <el-button type="primary" @click="confirm" v-if="selectedInstance === null">Search</el-button>
    <el-form-item class="submit">
      <el-button type="primary" class="login" @click="login" v-if="selectedInstance !== null">Login</el-button>
    </el-form-item>
  </el-form>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'login-form',
  data () {
    return {
      loginForm: {
        domainName: ''
      }
    }
  },
  computed: {
    ...mapState({
      selectedInstance: state => state.Login.selectedInstance
    })
  },
  methods: {
    login () {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.$store.dispatch('Login/fetchLogin', this.selectedInstance)
        .then((url) => {
          loading.close()
          this.$store.dispatch('Login/pageBack')
          this.$router.push({ path: '/authorize' })
        })
        .catch(() => {
          loading.close()
          this.$message({
            message: 'Could not get authorize url',
            type: 'error'
          })
        })
    },
    confirm () {
      this.$store.dispatch('Login/confirmInstance', this.loginForm.domainName)
        .then(() => {
          this.$message({
            message: `${this.loginForm.domainName} is confirmed, please login`,
            type: 'success'
          })
        })
        .catch(() => {
          this.$message({
            message: `${this.loginForm.domainName} does not exist`,
            type: 'error'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-form {
  margin: 0 auto;
  width: 300px;

  .instance-group {
    text-align: left;
    margin: 0 auto;
  }

  .instance-list {
    display: block;
    margin-left: 0 !important;
    border-color: #606266;
    color: #dcdfe6;
    margin-bottom: 10px;
  }

  .submit {
    margin: 0;
  }

  .back {
    margin-right: 20px;
  }

  .hidden {
    display: none;
  }
}
</style>
